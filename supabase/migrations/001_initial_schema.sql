-- ============================================================
-- Cocoa & Crumb — Initial Schema
-- ============================================================
-- Run via: supabase db push  OR  supabase migration up
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";   -- for full-text product search

-- ============================================================
-- 1. profiles  (extends auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  avatar_url    text,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can read own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: owner can update own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles: admins can read all" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Auto-create profile on sign-up
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

-- ============================================================
-- 2. addresses
-- ============================================================
create table public.addresses (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  label         text not null default 'Home',   -- 'Home', 'Office', etc.
  line1         text not null,
  line2         text,
  city          text not null default 'Pune',
  state         text not null default 'Maharashtra',
  pincode       text not null,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.addresses enable row level security;

create policy "addresses: owner" on public.addresses
  for all using (auth.uid() = user_id);

create index addresses_user_id_idx on public.addresses(user_id);

-- ============================================================
-- 3. categories
-- ============================================================
create table public.categories (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text not null unique,
  description   text,
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: public read" on public.categories
  for select using (is_active = true);

create policy "categories: admin write" on public.categories
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 4. products
-- ============================================================
create table public.products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  description     text,
  category_id     uuid references public.categories(id) on delete set null,
  base_price      numeric(10,2) not null,
  is_active       boolean not null default true,
  is_eggless      boolean not null default false,
  is_seasonal     boolean not null default false,
  is_bestseller   boolean not null default false,
  stock_count     int,                             -- null = unlimited
  tags            text[] not null default '{}',
  search_vector   tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: public read active" on public.products
  for select using (is_active = true);

create policy "products: admin write" on public.products
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index products_category_id_idx on public.products(category_id);
create index products_search_idx on public.products using gin(search_vector);
create index products_tags_idx on public.products using gin(tags);

-- ============================================================
-- 5. product_images
-- ============================================================
create table public.product_images (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  storage_path  text not null,
  alt_text      text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.product_images enable row level security;

create policy "product_images: public read" on public.product_images
  for select using (true);

create policy "product_images: admin write" on public.product_images
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index product_images_product_id_idx on public.product_images(product_id);

-- ============================================================
-- 6. product_variants
-- ============================================================
create table public.product_variants (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  label         text not null,         -- e.g. "500g", "1kg", "Box of 12"
  price_delta   numeric(10,2) not null default 0,
  stock_count   int,
  sort_order    int not null default 0,
  is_active     boolean not null default true
);

alter table public.product_variants enable row level security;

create policy "product_variants: public read active" on public.product_variants
  for select using (is_active = true);

create policy "product_variants: admin write" on public.product_variants
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index product_variants_product_id_idx on public.product_variants(product_id);

-- ============================================================
-- 7. orders
-- ============================================================
create type public.order_status as enum (
  'pending', 'confirmed', 'in_preparation', 'ready', 'out_for_delivery',
  'delivered', 'cancelled', 'refunded'
);

create type public.payment_status as enum (
  'unpaid', 'paid', 'partially_refunded', 'refunded'
);

create type public.fulfillment_type as enum ('delivery', 'pickup');

create table public.orders (
  id                  uuid primary key default uuid_generate_v4(),
  order_number        text not null unique,
  user_id             uuid references public.profiles(id) on delete set null,
  guest_email         text,
  guest_phone         text,
  status              public.order_status not null default 'pending',
  payment_status      public.payment_status not null default 'unpaid',
  fulfillment_type    public.fulfillment_type not null default 'delivery',
  subtotal            numeric(10,2) not null,
  delivery_charge     numeric(10,2) not null default 0,
  discount_amount     numeric(10,2) not null default 0,
  total               numeric(10,2) not null,
  currency            text not null default 'INR',
  delivery_address_id uuid references public.addresses(id) on delete set null,
  delivery_notes      text,
  requested_delivery  date,
  razorpay_order_id   text,
  razorpay_payment_id text,
  coupon_code         text,
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders: owner read" on public.orders
  for select using (auth.uid() = user_id);

create policy "orders: owner insert" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "orders: admin all" on public.orders
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);

-- Auto-generate human-readable order number
create or replace function public.generate_order_number()
returns text language plpgsql as $$
declare
  v_number text;
begin
  v_number := 'CC-' || to_char(now(), 'YYYYMMDD') || '-' ||
              lpad(floor(random() * 9000 + 1000)::text, 4, '0');
  return v_number;
end;
$$;

alter table public.orders
  alter column order_number set default public.generate_order_number();

-- ============================================================
-- 8. order_items
-- ============================================================
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid references public.products(id) on delete set null,
  variant_id      uuid references public.product_variants(id) on delete set null,
  product_name    text not null,    -- snapshot at time of order
  variant_label   text,
  unit_price      numeric(10,2) not null,
  quantity        int not null check (quantity > 0),
  gift_wrap       boolean not null default false,
  gift_message    text,
  line_total      numeric(10,2) generated always as (unit_price * quantity) stored
);

alter table public.order_items enable row level security;

create policy "order_items: owner read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

create policy "order_items: admin all" on public.order_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index order_items_order_id_idx on public.order_items(order_id);

-- ============================================================
-- 9. coupons
-- ============================================================
create type public.discount_type as enum ('percentage', 'fixed');

create table public.coupons (
  id                uuid primary key default uuid_generate_v4(),
  code              text not null unique,
  description       text,
  discount_type     public.discount_type not null,
  discount_value    numeric(10,2) not null,
  min_order_amount  numeric(10,2) not null default 0,
  max_uses          int,
  used_count        int not null default 0,
  valid_from        timestamptz not null default now(),
  valid_until       timestamptz,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

alter table public.coupons enable row level security;

create policy "coupons: active read" on public.coupons
  for select using (is_active = true and (valid_until is null or valid_until > now()));

create policy "coupons: admin all" on public.coupons
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 10. reviews
-- ============================================================
create table public.reviews (
  id            uuid primary key default uuid_generate_v4(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  rating        smallint not null check (rating between 1 and 5),
  title         text,
  body          text,
  is_approved   boolean not null default false,
  created_at    timestamptz not null default now(),
  unique (product_id, user_id)
);

alter table public.reviews enable row level security;

create policy "reviews: public read approved" on public.reviews
  for select using (is_approved = true);

create policy "reviews: owner insert" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "reviews: admin all" on public.reviews
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_user_id_idx on public.reviews(user_id);

-- ============================================================
-- 11. wishlists
-- ============================================================
create table public.wishlists (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.wishlists enable row level security;

create policy "wishlists: owner" on public.wishlists
  for all using (auth.uid() = user_id);

create index wishlists_user_id_idx on public.wishlists(user_id);

-- ============================================================
-- 12. gallery_images  (admin-managed, CMS-linked)
-- ============================================================
create table public.gallery_images (
  id            uuid primary key default uuid_generate_v4(),
  storage_path  text not null,
  alt_text      text,
  caption       text,
  category      text,    -- 'Chocolates', 'Cakes', 'Gifting', 'Behind the Scenes'
  is_featured   boolean not null default false,
  sort_order    int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

create policy "gallery_images: public read active" on public.gallery_images
  for select using (is_active = true);

create policy "gallery_images: admin write" on public.gallery_images
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 13. site_settings  (key-value store for CMS overrides)
-- ============================================================
create table public.site_settings (
  key           text primary key,
  value         jsonb not null,
  updated_at    timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "site_settings: public read" on public.site_settings
  for select using (true);

create policy "site_settings: admin write" on public.site_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 14. contact_messages
-- ============================================================
create table public.contact_messages (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  email         text not null,
  message       text not null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "contact_messages: insert only anon" on public.contact_messages
  for insert with check (true);

create policy "contact_messages: admin read" on public.contact_messages
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "contact_messages: admin update" on public.contact_messages
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ============================================================
-- 15. audit_log  (admin activity trail)
-- ============================================================
create table public.audit_log (
  id            bigint generated always as identity primary key,
  actor_id      uuid references public.profiles(id) on delete set null,
  action        text not null,   -- e.g. 'order.status_changed', 'product.created'
  entity_type   text not null,
  entity_id     uuid,
  payload       jsonb,
  created_at    timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "audit_log: admin read" on public.audit_log
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "audit_log: service insert" on public.audit_log
  for insert with check (true);   -- inserts come from server-side / service role

create index audit_log_entity_idx on public.audit_log(entity_type, entity_id);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Storage buckets (run via Supabase dashboard or supabase CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);
