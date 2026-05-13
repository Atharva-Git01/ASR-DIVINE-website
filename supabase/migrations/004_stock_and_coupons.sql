-- Migration 004: Stock management, coupon usage, product extra columns
-- ============================================================

-- 1. Add missing product columns (seed.py + ProductForm reference these)
alter table public.products
  add column if not exists serving_size  text,
  add column if not exists shelf_life    text;

-- 2. Stock decrement — safe, never goes below zero, skips unlimited products
create or replace function public.decrement_stock(p_product_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update public.products
  set stock_count = greatest(0, stock_count - p_qty)
  where id = p_product_id
    and stock_count is not null;   -- null = unlimited; leave it alone
end;
$$;

-- 3. Coupon used_count increment — atomic, avoids race conditions
create or replace function public.increment_coupon_used(p_coupon_id uuid)
returns void language plpgsql as $$
begin
  update public.coupons
  set used_count = used_count + 1
  where id = p_coupon_id;
end;
$$;

-- 4. Webhook events idempotency table (M-2 / processed_webhook_events)
create table if not exists public.processed_webhook_events (
  event_id      text primary key,
  processed_at  timestamptz not null default now()
);

alter table public.processed_webhook_events enable row level security;
-- No public access — service-role only

-- 5. Add password_hash to profiles for NextAuth-only credentials flow (ADR-002)
alter table public.profiles
  add column if not exists password_hash text;

-- 6. Add email to profiles (needed for customer receipt lookup)
alter table public.profiles
  add column if not exists email text unique;
