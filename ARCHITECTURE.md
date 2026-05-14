# Cocoa & Crumb — Architecture Decisions

This document records the key technical decisions made during the project and the reasoning behind each one.

---

## ADR-001: Content layer — Supabase only (Sanity removed)

**Date:** 2026-05

**Status:** Decided

### Context

The project was bootstrapped with both Supabase (relational data + auth) and
Sanity (headless CMS for rich editorial content). After Phase 1 development it
became clear that:

- All "product" data (name, price, images, variants) is transactional and
  belongs in Supabase alongside orders and customers.
- There is no editorial / long-form content requirement for Phase 1 (no blog,
  no complex landing-page builder).
- Running two data stores doubles operational overhead (two dashboards, two
  API surfaces, two sets of secrets, two CDNs to configure CORS for).

### Decision

**Remove Sanity. Use Supabase Storage + Supabase DB for all content.**

- Product images → Supabase Storage bucket `product-images` (CDN-proxied via
  the Supabase project URL).
- Product copy, categories, variants → `products`, `categories`,
  `product_variants` tables in Supabase Postgres.
- Rich text for product descriptions (if ever needed) → stored as Markdown in
  a `text` column and rendered client-side with a lightweight parser.

### Consequences

- `src/lib/sanity/` directory should be deleted (`git rm -r src/lib/sanity/`).
- `@sanity/client`, `next-sanity`, `sanity` packages should be removed from
  `package.json`.
- `remotePatterns` in `next.config.js` for `cdn.sanity.io` can be removed.
- If rich editorial content is needed in a future phase, Sanity (or Tiptap
  stored in Supabase) can be reintroduced.

---

## ADR-002: Authentication — NextAuth-only (Option A)

**Date:** 2026-05

**Status:** Decided

### Context

The app originally used both:

1. **NextAuth.js v4** — JWT sessions, `getToken()` for server-side checks,
   Google OAuth, credentials provider via `supabase.auth.signInWithPassword`.
2. **Supabase Auth** — `supabase.auth.signInWithPassword` for credentials login,
   `@auth/supabase-adapter` to sync sessions into `auth.users`.

Running both creates a dual session store problem:

- A NextAuth JWT and a Supabase session can diverge (e.g. password reset
  clears Supabase session but not the JWT cookie).
- `@auth/supabase-adapter` requires `service_role` writes on every login,
  adding latency and surface area.
- Two separate session concepts confuse the RLS model: Supabase RLS uses the
  Supabase Auth JWT; NextAuth protects API routes using its own JWT.

### Options considered

**Option A — NextAuth-only:**  
Remove `supabase.auth.signInWithPassword`; implement credentials provider by
querying a `user_credentials` table directly with bcrypt.  
Supabase RLS uses the service-role client on the server (already the pattern
for all admin operations).  
Single cookie, single JWT, single source of truth.

**Option B — Supabase Auth SSR:**  
Remove NextAuth; use `@supabase/ssr` cookies. Every protected route calls
`supabase.auth.getUser()`.  
Pros: native RLS JWT support.  
Cons: Google OAuth requires Supabase dashboard config; credentials flow is
less flexible; `getServerSideProps`/App Router adapter is newer and less
battle-tested than NextAuth.

### Decision

**Option A — NextAuth-only.**

- Credentials login: replace `supabase.auth.signInWithPassword` with a direct
  query to `profiles` table + `bcrypt.compare` against a `password_hash` column
  (migration required).
- All server-side data access uses the `adminDb()` service-role singleton —
  never the anon Supabase client; RLS is bypassed server-side (which is
  intentional given our `requireAdmin` guard pattern).
- `@auth/supabase-adapter` was removed in Phase 3 (no adapter = no sync writes
  on every login).

### Consequences

- Add `password_hash TEXT` column to `profiles` (new migration).
- Remove `supabase.auth.signInWithPassword` call from
  `src/lib/auth/options.ts`.
- Remove `supabase` (`@supabase/supabase-js` anon client) import from
  `options.ts`; use `adminDb()` for the credentials lookup.
- `next-auth` remains a dependency; `@auth/supabase-adapter` is already gone.

---

## ADR-003: Payment security — server-side price recomputation

**Date:** 2026-05

**Status:** Implemented (Phase security hardening)

### Context

The original `POST /api/payment/verify` trusted `item.price` values sent by
the browser. An attacker could modify client-side state to pass lower prices,
causing under-payment to be accepted.

Additionally, the HMAC signature check had a `if (secret !== 'placeholder')`
bypass that allowed the entire verification to be skipped in development or
when the secret was unset.

### Decision

1. **Strip all client-supplied price fields** from the verify endpoint.
   Accept only `productId`, `qty`, and display-only fields (`name`,
   `variantLabel`, `giftWrapped`, `giftMessage`).
2. **Fetch authoritative `base_price`** from `products` table server-side.
3. **Fetch the Razorpay payment object** via `razorpay.payments.fetch()` and
   compare `amount / 100` against the server-computed total. Reject on
   mismatch (> ₹0.50 tolerance for rounding).
4. **Remove the HMAC bypass** unconditionally. `RAZORPAY_KEY_SECRET` is now
   validated as `min(10)` in the Zod env schema — the server will not start
   with a placeholder value.
5. **Idempotency guard**: `processed_payments(razorpay_payment_id PK)` table
   prevents duplicate orders on network retries.

---

## Stack summary

| Concern         | Technology                                      |
| --------------- | ----------------------------------------------- |
| Framework       | Next.js 14 (App Router)                         |
| Language        | TypeScript (strict)                             |
| Package manager | pnpm 10                                         |
| Database        | Supabase Postgres                               |
| File storage    | Supabase Storage                                |
| Auth            | NextAuth.js v4 (JWT, Google OAuth, credentials) |
| API layer       | tRPC v10                                        |
| Payments        | Razorpay                                        |
| Email           | Resend (optional)                               |
| Notifications   | WhatsApp Cloud API (optional)                   |
| Error tracking  | Sentry (optional)                               |
| Rate limiting   | Upstash Redis (optional)                        |
| Unit tests      | Vitest + jsdom                                  |
| Dev tooling     | Python 3.11 + virtualenv `asrdivine`            |
