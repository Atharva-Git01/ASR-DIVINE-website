-- Migration 003: Idempotency guard for payment verification
-- Prevents double-order creation if the /api/payment/verify endpoint is
-- called more than once with the same Razorpay payment ID (network retry,
-- duplicate browser submit, replay attack, etc.).
--
-- Strategy: insert-or-nothing.  The caller inserts a row and checks the
-- affected-row count.  If 0 rows were inserted (conflict on PK), the
-- payment was already processed and we return 200 immediately without
-- creating a second order.

create table if not exists processed_payments (
  razorpay_payment_id text primary key,
  created_at          timestamptz not null default now()
);

-- No RLS needed — only the service-role key (server-side) touches this table.
-- Expose no SELECT policy so the table is invisible to anon/authenticated roles.
alter table processed_payments enable row level security;
