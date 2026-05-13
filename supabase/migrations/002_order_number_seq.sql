-- ─────────────────────────────────────────────────────────────
-- Migration 002: Collision-safe order number sequence
-- Replaces the Math.random()-based JS generator with a
-- Postgres sequence that guarantees uniqueness under any load.
-- ─────────────────────────────────────────────────────────────

-- Sequence starts at 1000 so early order numbers look substantial
create sequence if not exists order_number_seq start 1000 increment 1;

-- Format: CC-YYYYMMDD-NNNNN  e.g. CC-20240813-01042
create or replace function generate_order_number()
returns text
language sql
as $$
  select 'CC-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');
$$;
