create or replace function bulk_update_asset_balances(
  updates jsonb
) returns void language plpgsql as $$
begin
  update assets
  set current_balance = current_balance + item.amount
  from jsonb_to_recordset(updates) as item(id uuid, amount numeric)
  where assets.id = item.id
    and assets.user_id = auth.uid();
end;
$$;
