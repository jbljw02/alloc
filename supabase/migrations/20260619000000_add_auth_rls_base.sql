begin;

delete from public.allocations;
delete from public.assets;

alter table public.assets
  add column if not exists user_id uuid;

alter table public.allocations
  add column if not exists user_id uuid;

alter table public.assets
  alter column user_id set default auth.uid();

alter table public.allocations
  alter column user_id set default auth.uid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'assets_user_id_fkey'
      and conrelid = 'public.assets'::regclass
  ) then
    alter table public.assets
      add constraint assets_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'allocations_user_id_fkey'
      and conrelid = 'public.allocations'::regclass
  ) then
    alter table public.allocations
      add constraint allocations_user_id_fkey
      foreign key (user_id)
      references auth.users(id)
      on delete cascade;
  end if;
end;
$$;

create index if not exists assets_user_id_idx
  on public.assets (user_id);

create index if not exists allocations_user_id_idx
  on public.allocations (user_id);

create index if not exists allocations_user_id_asset_id_idx
  on public.allocations (user_id, asset_id);

alter table public.assets enable row level security;
alter table public.allocations enable row level security;

commit;
