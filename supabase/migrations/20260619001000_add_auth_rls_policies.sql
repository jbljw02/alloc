begin;

drop policy if exists "assets_select_own" on public.assets;
drop policy if exists "assets_insert_own" on public.assets;
drop policy if exists "assets_update_own" on public.assets;
drop policy if exists "assets_delete_own" on public.assets;

create policy "assets_select_own"
  on public.assets
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "assets_insert_own"
  on public.assets
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "assets_update_own"
  on public.assets
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "assets_delete_own"
  on public.assets
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "allocations_select_own" on public.allocations;
drop policy if exists "allocations_insert_own" on public.allocations;
drop policy if exists "allocations_update_own" on public.allocations;
drop policy if exists "allocations_delete_own" on public.allocations;

create policy "allocations_select_own"
  on public.allocations
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "allocations_insert_own"
  on public.allocations
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.assets
      where assets.id = asset_id
        and assets.user_id = auth.uid()
    )
  );

create policy "allocations_update_own"
  on public.allocations
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.assets
      where assets.id = asset_id
        and assets.user_id = auth.uid()
    )
  );

create policy "allocations_delete_own"
  on public.allocations
  for delete
  to authenticated
  using (user_id = auth.uid());

commit;
