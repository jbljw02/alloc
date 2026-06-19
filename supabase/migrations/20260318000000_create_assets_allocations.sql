create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  category text not null,
  current_balance numeric,
  icon_name text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  asset_id uuid not null references public.assets(id) on delete cascade,
  input_amount numeric not null,
  allocation_month date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
