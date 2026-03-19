create or replace function public.bulk_update_assets(
  updates jsonb
)
returns setof public.assets
language plpgsql
as $$
declare
  update_item jsonb;
  update_id uuid;
  next_balance numeric;
begin
  if jsonb_typeof(updates) <> 'array' then
    raise exception 'updates must be a json array';
  end if;

  for update_item in
    select value
    from jsonb_array_elements(updates)
  loop
    if (update_item ? 'id') = false then
      raise exception 'id is required for every update item';
    end if;

    if (update_item ? 'current_balance') = false then
      raise exception 'current_balance is required for every update item';
    end if;

    update_id := (update_item ->> 'id')::uuid;

    if jsonb_typeof(update_item -> 'current_balance') = 'null' then
      next_balance := null;
    else
      next_balance := (update_item ->> 'current_balance')::numeric;
    end if;

    update public.assets
    set
      current_balance = next_balance,
      updated_at = now()
    where id = update_id;

    if not found then
      raise exception 'asset not found: %', update_id;
    end if;
  end loop;

  return query
  select assets.*
  from public.assets
  join (
    select (value ->> 'id')::uuid as id
    from jsonb_array_elements(updates)
  ) as updated_ids
    on updated_ids.id = assets.id;
end;
$$;

