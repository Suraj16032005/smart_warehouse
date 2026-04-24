-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create trigger profiles_updated before update on public.profiles
for each row execute function public.set_updated_at();

-- products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  description text,
  unit text default 'pcs',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "own products all" on public.products for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger products_updated before update on public.products
for each row execute function public.set_updated_at();
create index products_user_idx on public.products(user_id);

-- inventory (one row per product)
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade unique,
  quantity integer not null default 0,
  low_stock_threshold integer not null default 10,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.inventory enable row level security;
create policy "own inventory all" on public.inventory for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger inventory_updated before update on public.inventory
for each row execute function public.set_updated_at();
create index inventory_user_idx on public.inventory(user_id);

-- alerts
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  message text not null,
  severity text not null default 'warning',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.alerts enable row level security;
create policy "own alerts all" on public.alerts for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index alerts_user_idx on public.alerts(user_id);

-- low-stock alert trigger
create or replace function public.check_low_stock()
returns trigger language plpgsql security definer set search_path = public as $$
declare pname text;
begin
  if new.quantity <= new.low_stock_threshold then
    select name into pname from public.products where id = new.product_id;
    insert into public.alerts (user_id, product_id, message, severity)
    values (new.user_id, new.product_id,
      coalesce(pname,'Product') || ' is low on stock (' || new.quantity || ' left)',
      case when new.quantity = 0 then 'critical' else 'warning' end);
  end if;
  return new;
end $$;
create trigger inventory_low_stock after insert or update of quantity on public.inventory
for each row execute function public.check_low_stock();