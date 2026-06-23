-- ============================================================
-- Doctermatee — Migration 001: Initial Schema
-- ============================================================

-- ---------- Extensions ----------
create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  role          text not null default 'customer' check (role in ('customer','admin')),
  default_address jsonb,
  created_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- categories ----------
create table public.categories (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null,
  slug  text not null unique
);

-- ---------- products ----------
create table public.products (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid references public.categories(id) on delete set null,
  price            numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price >= 0),
  sku              text,
  fda_no           text,
  stock            integer not null default 0 check (stock >= 0),
  status           text not null default 'draft' check (status in ('active','draft')),
  images           text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- ---------- coupons ----------
create table public.coupons (
  code        text primary key,
  type        text not null check (type in ('percent','fixed')),
  value       numeric(10,2) not null check (value > 0),
  min_order   numeric(10,2) not null default 0,
  expires_at  timestamptz,
  usage_limit integer,
  used_count  integer not null default 0,
  active      boolean not null default true
);

-- ---------- orders ----------
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  order_no         text not null unique,
  user_id          uuid references public.profiles(id) on delete set null,
  status           text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  payment_status   text not null default 'unpaid' check (payment_status in ('unpaid','paid','failed')),
  subtotal         numeric(10,2) not null,
  discount         numeric(10,2) not null default 0,
  shipping_fee     numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text references public.coupons(code) on delete set null,
  shipping_address jsonb not null,
  tracking_no      text,
  carrier          text,
  created_at       timestamptz not null default now()
);

-- ---------- order_items ----------
create table public.order_items (
  id         uuid primary key default uuid_generate_v4(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name       text not null,
  price      numeric(10,2) not null,
  qty        integer not null check (qty > 0)
);

-- ---------- payment_events ----------
create table public.payment_events (
  id             uuid primary key default uuid_generate_v4(),
  omise_event_id text not null unique,
  order_id       uuid references public.orders(id) on delete set null,
  type           text not null,
  raw            jsonb not null,
  created_at     timestamptz not null default now()
);

-- ---------- articles ----------
create table public.articles (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  slug            text not null unique,
  excerpt         text,
  body            text,
  cover           text,
  seo_title       text,
  seo_description text,
  published_at    timestamptz,
  created_at      timestamptz not null default now()
);

-- ---------- site_settings ----------
create table public.site_settings (
  key   text primary key,
  value jsonb not null
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.coupons        enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.payment_events enable row level security;
alter table public.articles       enable row level security;
alter table public.site_settings  enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- profiles ----
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admin can view all profiles"
  on public.profiles for select using (public.is_admin());

-- ---- categories ----
create policy "Anyone can view categories"
  on public.categories for select using (true);
create policy "Admin can manage categories"
  on public.categories for all using (public.is_admin());

-- ---- products ----
create policy "Anyone can view active products"
  on public.products for select using (status = 'active' or public.is_admin());
create policy "Admin can manage products"
  on public.products for all using (public.is_admin());

-- ---- coupons ----
create policy "Admin can manage coupons"
  on public.coupons for all using (public.is_admin());
create policy "Authenticated can read active coupons"
  on public.coupons for select using (auth.uid() is not null and active = true);

-- ---- orders ----
create policy "Users can view own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admin can view all orders"
  on public.orders for select using (public.is_admin());
create policy "Admin can update orders"
  on public.orders for update using (public.is_admin());

-- ---- order_items ----
create policy "Users can view own order items"
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Users can insert order items"
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Admin can view all order items"
  on public.order_items for select using (public.is_admin());

-- ---- payment_events ----
create policy "Admin can view payment events"
  on public.payment_events for all using (public.is_admin());

-- ---- articles ----
create policy "Anyone can view published articles"
  on public.articles for select using (published_at is not null and published_at <= now() or public.is_admin());
create policy "Admin can manage articles"
  on public.articles for all using (public.is_admin());

-- ---- site_settings ----
create policy "Anyone can read site settings"
  on public.site_settings for select using (true);
create policy "Admin can manage site settings"
  on public.site_settings for all using (public.is_admin());
