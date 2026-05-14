# Cocoa & Crumb — Implementation Plan

> Based on professional code review. Ordered by priority: security → correctness → maintainability → polish.

---

## Phase 1 — Security & Correctness (Do First)

### 1.1 Add Server-Side Admin Guard to All Admin API Routes

**Problem:** `/api/admin/*` routes rely solely on middleware for protection. A misconfigured
matcher or direct API call bypasses it entirely.

**Fix:** Add an auth check at the top of every admin route handler.

Create `src/lib/auth/require-admin.ts`:

```ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }).catch(() => null)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!token.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null // null = OK, proceed
}
```

Then in every `src/app/api/admin/**/*.ts`:

```ts
const guard = await requireAdmin(request)
if (guard) return guard
```

**Files to update:**

- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `src/app/api/admin/gallery/upload/route.ts`
- `src/app/api/admin/gallery/reorder/route.ts`
- `src/app/api/admin/gallery/[id]/route.ts`
- `src/app/api/admin/orders/[id]/status/route.ts`
- `src/app/api/admin/messages/[id]/read/route.ts`

---

### 1.2 Fix Supabase Client — Singleton Pattern

**Problem:** `db()` in `src/lib/trpc/router.ts` calls `createClient()` on every tRPC
invocation. In serverless this causes unnecessary connection overhead and potential pool
exhaustion under load.

**Fix:** Create a single lazily-initialised admin client.

Create `src/lib/supabase/admin-singleton.ts`:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}
```

Replace all inline `createClient(url, serviceKey)` calls in `router.ts` and the two
payment routes with `getAdminClient()`.

---

### 1.3 Collision-Safe Order Numbers

**Problem:** `Math.random()` gives only 9,000 unique values per day. At modest volume
(>100 orders/day) collisions become statistically likely.

**Fix:** Use a Postgres sequence — already available via the `uuid-ossp` extension.

Add to migration (or a new migration `002_order_number_seq.sql`):

```sql
create sequence if not exists order_number_seq start 1000 increment 1;

create or replace function generate_order_number()
returns text language sql as $$
  select 'CC-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');
$$;
```

In `src/app/api/payment/verify/route.ts`, replace the JS function with:

```ts
const { data: seqData } = await supabase.rpc('generate_order_number')
const orderNumber = seqData as string
```

---

## Phase 2 — Architecture Cleanup

### 2.1 Consolidate the Auth Layer (Choose One)

**Problem:** NextAuth.js + Supabase Auth running in parallel creates two session stores,
two token formats, and extra DB lookups on every Google sign-in to sync the `is_admin` flag.

**Recommended:** Keep NextAuth.js (it's already the source of truth for sessions/JWTs) and
remove direct `supabase.auth.signInWithPassword` calls. Use the Supabase **service-role client**
only for DB operations, not for auth.

**What changes:**

- In `src/lib/auth/options.ts` → `CredentialsProvider.authorize`: instead of calling
  `supabase.auth.signInWithPassword`, validate credentials against a `user_credentials`
  table (or keep Supabase Auth but never expose its session to the frontend — only use it
  server-side as a password validator).
- Remove `@auth/supabase-adapter` — it tries to sync users into Supabase Auth, which
  conflicts with your manual profile creation trigger.
- Keep the `profiles` table and the `handle_new_user` trigger for DB-level profile data.

**Alternative (simpler):** Drop NextAuth entirely and use Supabase Auth's built-in SSR
helpers (`@supabase/ssr`) for session management. Migrate `token.isAdmin` checks to
Supabase's `getUser()` + a DB lookup.

---

### 2.2 Clarify Sanity vs Supabase for Product Data

**Problem:** `src/lib/sanity/client.ts` and `src/lib/sanity/queries.ts` exist alongside
Supabase product tables. Having two data sources for the same entity causes staleness and
maintenance burden.

**Decision to make (pick one):**

| Option | Sanity (CMS)                      | Supabase (DB)                   |
| ------ | --------------------------------- | ------------------------------- |
| A      | Rich text, images, marketing copy | Prices, stock, variants, orders |
| B      | Not used — remove it              | Everything                      |

If choosing **Option A** (recommended for a real bakery client):

- Product descriptions, hero images, and page content live in Sanity.
- Inventory, pricing, and orders live in Supabase.
- Merge them at query time in `products.bySlug` using the product `slug` as a shared key.

If choosing **Option B**: delete `src/lib/sanity/` and remove `@sanity/client` from
`package.json`.

---

## Phase 3 — Test Coverage

### 3.1 Unit Tests (Vitest)

Currently `src/test/setup.ts` exists but no tests are written. Add tests for all
business-critical logic:

**Cart store** — `src/test/cart.test.ts`:

- `addItem` with duplicate product/variant increments qty
- `updateQty(id, 0)` removes the item
- `subtotal()` matches sum of `price * qty`
- `persist` key is `cocoa-crumb-cart`

**Payment verification** — `src/test/payment.test.ts`:

- HMAC signature validation rejects tampered payloads
- Invalid amount returns 400
- Rate limiter returns 429 on excess requests (mock Upstash)

**Order number** — `src/test/order-number.test.ts`:

- Sequence-based numbers are unique across 1000 iterations
- Format matches `CC-YYYYMMDD-NNNNN`

**tRPC procedures** — `src/test/trpc.test.ts`:

- `protectedProcedure` throws UNAUTHORIZED when `ctx.userId` is null
- `adminProcedure` throws FORBIDDEN when `ctx.isAdmin` is false

### 3.2 Integration Tests (Optional, Phase 4)

Once unit tests are green, add integration tests using a Supabase local dev instance
(`supabase start`) and Vitest's browser mode or Playwright.

---

## Phase 4 — Developer Experience

### 4.1 Environment Variable Validation at Startup

Add `src/lib/env.ts` using Zod to validate all required env vars at build time:

```ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().startsWith('rzp_'),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

Import `env` at the top of every lib file instead of `process.env.X!`.

### 4.2 Structured Logging

Replace bare `console.log` / `console.error` calls with a thin wrapper that includes
request IDs and timestamps. Sentry is already wired up — ensure all caught errors are
forwarded with `Sentry.captureException`.

### 4.3 Database Seeding Script

Add `scripts/seed.py` (Python, uses this project's virtualenv) to populate the local
Supabase instance with realistic test data using `faker`.

---

## Phase 5 — Product Features (Backlog)

| Feature                   | Notes                                                                    |
| ------------------------- | ------------------------------------------------------------------------ |
| Stock management          | Add `stock_qty` to `products`, decrement on order                        |
| Email notifications       | Extend `order-placed` to send customer confirmation (Resend/Nodemailer)  |
| Coupon validation in tRPC | Currently coupons exist in DB but aren't applied server-side at checkout |
| Analytics dashboard       | Wire admin analytics page to real Supabase aggregates                    |
| Webhook idempotency       | Store processed Razorpay event IDs to prevent double-processing          |
| Pincode delivery check    | Validate delivery availability before checkout                           |
| Image optimisation        | Replace raw Storage URLs with Next.js `<Image>` + Supabase CDN           |

---

## Execution Order

```
Phase 1 (1–2 days)  →  Phase 2 (2–3 days)  →  Phase 3 (2 days)  →  Phase 4 (1 day)  →  Phase 5 (ongoing)
Security fixes          Auth cleanup            Test suite           DX polish            Features
```

---

## Python Tooling (this repo's virtualenv)

A Python virtualenv named `asrdivine` is included for developer scripts:

```bash
# Activate (Windows)
asrdivine\Scripts\activate

# Activate (Linux/Mac)
source asrdivine/bin/activate

# Install deps
pip install -r requirements.txt
```

### Available scripts (add to `scripts/`)

| Script                     | Purpose                                                    |
| -------------------------- | ---------------------------------------------------------- |
| `scripts/seed.py`          | Seed local Supabase with fake products, categories, orders |
| `scripts/health_check.py`  | Hit all tRPC endpoints and report status                   |
| `scripts/export_orders.py` | Export orders from Supabase to CSV for reporting           |
| `scripts/validate_env.py`  | Check all required env vars are present before deploy      |
