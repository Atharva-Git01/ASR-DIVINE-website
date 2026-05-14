# Cocoa & Crumb — Ship-Ready Implementation Plan

> Produced after full source review. Items are ordered by severity — fix blockers first,
> then wiring gaps, then hardening, then polish, then deploy.
>
> **Legend:** 🔴 Blocker · 🟠 High · 🟡 Medium · 🟢 Low

---

## BLOCKER — Things that will break in production right now

---

### 🔴 B-1 · Dual Product Databases (The Biggest Problem)

**What's happening:** The shop frontend (`/shop`, `/shop/product/[slug]`) reads products
from **Sanity CMS**. The admin panel (`/admin/products`) writes products to **Supabase**.
The checkout saves `product_id` from Sanity items into `order_items.product_id`, which is
a UUID foreign key pointing at the **Supabase** products table.

**Result:** Every real order will fail a foreign-key constraint because Sanity `_id`s
(e.g. `"abc123def456"`) are not Supabase UUIDs.

**Fix — pick one of two paths:**

**Path A (recommended — keep Sanity as CMS):**

1. Remove Supabase `products` and `categories` tables from the schema (or keep as read-only
   mirror). Sanity is the catalogue.
2. In `order_items`, change `product_id` from a FK UUID to a plain `text` column that
   stores the Sanity `_id`. Remove the foreign key constraint.
3. Remove the tRPC `products.*` and `categories.*` procedures — the shop doesn't use them.
4. Admin product management → redirect to Sanity Studio (or embed it). Delete
   `/admin/products` and the `/api/admin/products` routes. They're a parallel system that
   nobody reads from.

**Path B (drop Sanity, go all-Supabase):**

1. Delete `src/lib/sanity/`. Remove `@sanity/client` from `package.json`.
2. Replace all `sanityFetch()` calls in shop pages with the tRPC `products.list` /
   `products.bySlug` procedures. Add image upload to the admin product form (see B-4).
3. Already have the full Supabase product schema — just use it end-to-end.

**Files touched:**

- `supabase/migrations/001_initial_schema.sql` — alter `order_items.product_id`
- `src/app/(shop)/shop/page.tsx`
- `src/app/(shop)/shop/product/[slug]/page.tsx`
- `src/components/home/BestsellersSection.tsx`
- `src/lib/trpc/router.ts`
- `src/app/api/admin/products/**`

---

### 🔴 B-2 · Account Orders Page Shows Hardcoded Demo Data

**File:** `src/app/(shop)/account/orders/page.tsx`

The file has `const DEMO_ORDERS = [...]` with a comment
_"Placeholder orders until tRPC + Supabase is connected."_
This page is reachable by real logged-in users and will show fictional orders.

**Fix:**

```tsx
// Replace the static DEMO_ORDERS with a real tRPC call
import { api } from '@/lib/trpc/client'

export default async function OrdersPage() {
  // Use the already-built tRPC orders.list procedure
  const { items } = await serverClient.orders.list()
  // render items...
}
```

The tRPC `orders.list` procedure is already written and paginated — just wire it up.

---

### 🔴 B-3 · Admin API Routes Have No Server-Side Auth Check

**Problem:** Middleware protects `/admin` page routes. But direct `POST /api/admin/products`
calls bypass middleware entirely. Any user (or bot) can hit these endpoints.

**Fix — create `src/lib/auth/require-admin.ts`:**

```ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }).catch(() => null)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!token.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}
```

Then at the top of every admin route handler:

```ts
const guard = await requireAdmin(request)
if (guard) return guard
```

**All routes that need this:**

- `/api/admin/products/route.ts` + `/api/admin/products/[id]/route.ts`
- `/api/admin/categories/route.ts` + `/api/admin/categories/[id]/route.ts`
- `/api/admin/coupons/route.ts` + `/api/admin/coupons/[id]/route.ts`
- `/api/admin/gallery/upload/route.ts` + `/api/admin/gallery/reorder/route.ts` + `/api/admin/gallery/[id]/route.ts`
- `/api/admin/orders/[id]/status/route.ts`
- `/api/admin/messages/[id]/read/route.ts`

---

### 🔴 B-4 · Product Form Has No Image Upload

**File:** `src/components/admin/ProductForm.tsx`

The form has fields for name, price, stock, toggles — but **no way to upload or attach
images**. Products created through the admin will have no images in the shop.

**Fix:**

1. Add a file input that uploads to Supabase Storage bucket `product-images`.
2. On upload, insert a row into `product_images(product_id, storage_path, alt_text, sort_order)`.
3. Show uploaded images with delete/reorder controls.

```ts
// Upload flow
const { data } = await supabase.storage
  .from('product-images')
  .upload(`${productId}/${file.name}`, file)

await supabase.from('product_images').insert({
  product_id: productId,
  storage_path: data.path,
  alt_text: altText,
  sort_order: 0,
})
```

Note: Create the `product-images` storage bucket in Supabase dashboard with public read access.

---

### 🔴 B-5 · Order Confirmation Page Has No Ownership Check

**File:** `src/app/(shop)/order/[id]/page.tsx`

`getOrder(id)` fetches any order by UUID with the service-role key and no auth check.
Anyone who guesses (or brute-forces) a UUID can see another customer's order details,
address, and items.

**Fix:**

```ts
async function getOrder(id: string, userId: string | null, guestEmail: string | null) {
  let query = supabase.from('orders').select('*, order_items(*)').eq('id', id)
  if (userId) {
    query = query.eq('user_id', userId)
  } else if (guestEmail) {
    query = query.eq('guest_email', guestEmail)
  } else {
    return null // no way to verify ownership
  }
  const { data } = await query.single()
  return data
}
```

Pass the session's userId or the address email (stored in session/cookie during checkout)
to verify ownership before rendering.

---

### 🔴 B-6 · WhatsApp Bakery Phone Number is Hardcoded

**File:** `src/app/api/notifications/order-placed/route.ts` — line 45:

```ts
const bakeryPhone = '919876543210' // ← fake placeholder hardcoded
```

This is a dummy number. In production, notifications go nowhere (or to the wrong person).

**Fix:**

```ts
const bakeryPhone = process.env.WHATSAPP_BAKERY_PHONE ?? ''
if (!bakeryPhone) return // skip if not configured
```

Add `WHATSAPP_BAKERY_PHONE` to `.env.local` and to CI secrets.

---

## HIGH PRIORITY — Ship with these, but not immediate blockers

---

### 🟠 H-1 · No Customer Confirmation Email

**File:** `src/app/api/notifications/order-placed/route.ts`

`sendOrderEmail` only sends to `orders@cocoaandcrumb.in` (the bakery). The customer gets
nothing — no receipt, no confirmation, no tracking.

**Fix:** Fetch the customer's email from the order and send them a receipt:

```ts
// Fetch order + user email from Supabase
const { data: order } = await supabase
  .from('orders')
  .select('*, profiles(email:id)')
  .eq('id', orderId)
  .single()

const customerEmail = order?.guest_email ?? order?.profiles?.email
if (customerEmail) {
  await sendCustomerReceipt(customerEmail, order)
}
```

The customer email template should include: order number, item list, total, delivery address,
and estimated delivery time.

---

### 🟠 H-2 · Coupon Code Field Missing from Checkout

**Files:** `src/components/checkout/CartReviewStep.tsx`, `src/components/checkout/CheckoutFlow.tsx`

The admin panel has a full CouponManager and the DB has a `coupons` table — but there is
no coupon input field anywhere in the checkout UI. Coupons are currently unusable.

**Fix:**

1. Add a coupon input + "Apply" button to `CartReviewStep`.
2. On apply, call a new tRPC procedure `coupons.validate`:

```ts
coupons: router({
  validate: publicProcedure
    .input(z.object({ code: z.string(), subtotal: z.number() }))
    .mutation(async ({ input }) => {
      const { data } = await db()
        .from('coupons')
        .select('*')
        .eq('code', input.code.toUpperCase())
        .eq('is_active', true)
        .single()
      if (!data) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid coupon code' })
      if (data.expires_at && new Date(data.expires_at) < new Date())
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Coupon has expired' })
      // calculate discount...
      return { discount: calculatedDiscount, couponId: data.id }
    }),
})
```

3. Pass `discount_amount` and `coupon_id` through `CheckoutFlow` state to the `verify` route,
   which already has a `discount_amount: 0` placeholder.

---

### 🟠 H-3 · Supabase Client Created on Every tRPC Call

**File:** `src/lib/trpc/router.ts`

The `db()` function calls `createClient()` on every procedure invocation. In serverless,
each warm invocation re-establishes a connection, wasting ~50–100ms per request.

**Fix — create `src/lib/supabase/admin-singleton.ts`:**

```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getAdminClient(): SupabaseClient {
  return (_client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ))
}
```

Replace all inline `createClient(url, serviceKey)` calls in:

- `src/lib/trpc/router.ts`
- `src/app/api/payment/verify/route.ts`
- `src/app/api/webhooks/razorpay/route.ts`
- `src/app/(shop)/order/[id]/page.tsx`

---

### 🟠 H-4 · No Stock Decrement on Order

The `products` table has `stock_count`. The admin form exposes it. But nowhere in the
order flow is stock decremented when a purchase completes.

**Fix:** In `src/app/api/payment/verify/route.ts`, after inserting `order_items`, run:

```ts
for (const item of items) {
  await supabase.rpc('decrement_stock', {
    p_product_id: item.productId,
    p_qty: item.qty,
  })
}
```

Add the function to migration `002_...sql`:

```sql
create or replace function decrement_stock(p_product_id uuid, p_qty int)
returns void language plpgsql as $$
begin
  update products
  set stock_count = greatest(0, stock_count - p_qty)
  where id = p_product_id and stock_count is not null;
end;
$$;
```

---

### 🟠 H-5 · Order Number Collision Risk

**File:** `src/app/api/payment/verify/route.ts`

```ts
;`CC-${date}-${Math.floor(1000 + Math.random() * 9000)}`
```

9,000 possible values per day. At >30 orders/day there's a statistically meaningful
collision risk. In production, duplicate order numbers cause fulfilment chaos.

**Fix:** Use a Postgres sequence (add to `002_order_number_seq.sql`):

```sql
create sequence if not exists order_number_seq start 1000;

create or replace function generate_order_number()
returns text language sql as $$
  select 'CC-' || to_char(now(), 'YYYYMMDD') || '-'
         || lpad(nextval('order_number_seq')::text, 5, '0');
$$;
```

Replace the JS function with:

```ts
const { data: orderNum } = await supabase.rpc('generate_order_number')
const orderNumber = orderNum as string
```

---

### 🟠 H-6 · Hardcoded Notification Email Address

**File:** `src/app/api/notifications/order-placed/route.ts` — line 35:

```ts
to: ['orders@cocoaandcrumb.in'],
```

Move to env var so it can be changed without a code deploy:

```ts
to: [process.env.BAKERY_NOTIFY_EMAIL ?? 'orders@cocoaandcrumb.in'],
```

Add `BAKERY_NOTIFY_EMAIL` to `.env.local`.

---

## MEDIUM PRIORITY — Do before public launch

---

### 🟡 M-1 · No Env Var Validation at Startup

Missing env vars surface as cryptic runtime errors deep in API calls. A single Zod
schema at startup catches them before a single request is served.

**Create `src/lib/env.ts`:**

```ts
import { z } from 'zod'

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().startsWith('rzp_'),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  RESEND_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_BAKERY_PHONE: z.string().optional(),
  BAKERY_NOTIFY_EMAIL: z.string().email().optional(),
})

export const env = schema.parse(process.env)
```

Import `env` everywhere instead of bare `process.env.X!`.

---

### 🟡 M-2 · Webhook Idempotency (Double-Processing Risk)

**File:** `src/app/api/webhooks/razorpay/route.ts`

Razorpay retries webhooks on timeout. If your server is slow, the same `payment.captured`
event fires twice → order updated twice (harmless) but potentially order-created twice
if you ever move creation logic to the webhook.

**Fix:** Track processed event IDs:

```sql
create table if not exists processed_webhook_events (
  event_id text primary key,
  processed_at timestamptz not null default now()
);
```

```ts
const eventId = request.headers.get('x-razorpay-event-id') ?? ''
if (eventId) {
  const { error } = await supabase.from('processed_webhook_events').insert({ event_id: eventId })
  if (error?.code === '23505') {
    // unique violation
    return NextResponse.json({ received: true, duplicate: true })
  }
}
```

---

### 🟡 M-3 · Unit Test Coverage

Currently zero test files exist despite a full Vitest setup. Before launch, write at minimum:

| File                       | What to test                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `src/test/cart.test.ts`    | addItem deduplication, updateQty(0) removes, subtotal()       |
| `src/test/payment.test.ts` | HMAC verify rejects bad signature, invalid amount → 400       |
| `src/test/trpc.test.ts`    | protectedProcedure → UNAUTHORIZED, adminProcedure → FORBIDDEN |
| `src/test/coupon.test.ts`  | Expired coupon rejected, inactive coupon rejected             |

---

### 🟡 M-4 · `<img>` Tags Should Use Next.js `<Image>`

**Files:**

- `src/app/(shop)/shop/product/[slug]/page.tsx` (related products grid — has ESLint disable comment)
- `src/components/shop/ProductDetailClient.tsx`
- `src/components/shop/ProductGrid.tsx`
- `src/components/home/BestsellersSection.tsx`

Raw `<img>` tags skip Next.js image optimisation (WebP conversion, lazy loading, size hints).
Replace with `next/image`. Add Sanity's CDN and Supabase Storage domains to
`next.config.mjs`:

```js
images: {
  remotePatterns: [
    { hostname: 'cdn.sanity.io' },
    { hostname: '*.supabase.co' },
  ],
}
```

---

### 🟡 M-5 · Pincode / Delivery Zone Validation

Currently any 6-digit pincode is accepted. If the bakery only delivers to certain areas
of Pune, an order with an out-of-zone pincode will be placed, paid, and then manually
rejected — a bad customer experience.

**Fix:**

1. Add a `delivery_zones` table with allowed pincodes or pincode ranges.
2. In `AddressStep`, call a `delivery.checkPincode` tRPC procedure before allowing Next.
3. Show a friendly "Sorry, we don't deliver to this pincode yet" message.

---

### 🟡 M-6 · Consolidate Auth Layer

Currently NextAuth.js + Supabase Auth run simultaneously. This was flagged in the initial
review. For shipping, the minimum fix is:

1. Remove `SupabaseAdapter` from `authOptions` — it tries to sync users into Supabase Auth,
   conflicting with the manual `handle_new_user` trigger.
2. Keep Supabase purely as a **database** accessed with the service-role key.
3. Keep NextAuth for session management.

This removes a class of subtle sync bugs where a user exists in NextAuth but not in `profiles`,
or vice versa.

---

## LOW PRIORITY — Quality of life, do after launch

---

### 🟢 L-1 · `confirm()` Dialog for Delete Actions

**File:** `src/components/admin/ProductForm.tsx`

```ts
if (!confirm('Delete this product? This cannot be undone.')) return
```

Native `confirm()` is blocked in some browser contexts and is unstyled. Replace with a
proper modal dialog component before users notice.

---

### 🟢 L-2 · Sentry Source Maps

Sentry is configured but without source maps, production errors show minified stack traces
(`chunk-abc123.js:1:45892`) instead of real file names and line numbers.

In `next.config.mjs`:

```js
import { withSentryConfig } from '@sentry/nextjs'
export default withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'cocoa-and-crumb',
  widenClientFileUpload: true,
})
```

---

### 🟢 L-3 · robots.ts and sitemap.ts Need Real Domain

**Files:** `src/app/robots.ts`, `src/app/sitemap.ts`

These likely contain placeholder URLs. Update them to `https://cocoaandcrumb.in` before
going live, or they'll tell Google the wrong canonical URL.

---

### 🟢 L-4 · Rate-limit All Mutation Endpoints

Currently only `/api/payment/create-order` is rate-limited. Consider applying the Upstash
rate limiter to:

- `/api/custom-order` (form submission spam)
- `/api/auth/[...nextauth]` (brute-force login attempts)
- `/api/admin/**` (defence in depth)

---

## DEPLOYMENT CHECKLIST

Run through this before going live:

```
Infrastructure
  ☐ Supabase project created (not on free tier — production needs at least Pro)
  ☐ supabase db push run against production
  ☐ product-images storage bucket created with public read policy
  ☐ Sanity project + dataset configured (if keeping Sanity)
  ☐ Sanity Studio deployed or accessible
  ☐ Razorpay live keys obtained (switch from rzp_test_ to rzp_live_)
  ☐ Razorpay webhook URL set to https://cocoaandcrumb.in/api/webhooks/razorpay
  ☐ Upstash Redis instance created
  ☐ Resend account + domain verified for orders@cocoaandcrumb.in
  ☐ WhatsApp Business API credentials obtained

Vercel Setup
  ☐ Repo connected to Vercel
  ☐ All env vars added to Vercel project settings (not just .env.local)
  ☐ NEXTAUTH_URL set to production domain
  ☐ NEXT_PUBLIC_APP_URL set to production domain
  ☐ Custom domain cocoaandcrumb.in pointed to Vercel

Google OAuth
  ☐ Production redirect URI added: https://cocoaandcrumb.in/api/auth/callback/google
  ☐ App verified (or test users added if in testing mode)

Pre-launch smoke test
  ☐ Guest checkout end-to-end with a real ₹1 Razorpay test payment
  ☐ Logged-in checkout end-to-end
  ☐ Admin can create, edit, and deactivate a product
  ☐ Order appears in admin panel after checkout
  ☐ Admin can update order status
  ☐ Customer receives confirmation email
  ☐ Bakery receives WhatsApp alert
  ☐ /account/orders shows real orders for logged-in user
  ☐ Mobile layout reviewed on an actual phone (not just devtools)
  ☐ Lighthouse score run: aim for 90+ performance, 100 accessibility
```

---

## Summary — Work Order

| #   | Item                                           | Effort   | Priority |
| --- | ---------------------------------------------- | -------- | -------- |
| B-1 | Unify product data source (Sanity vs Supabase) | 1–2 days | 🔴 First |
| B-2 | Wire account orders page to tRPC               | 2 hours  | 🔴       |
| B-3 | Add server-side admin auth to all API routes   | 2 hours  | 🔴       |
| B-4 | Add image upload to ProductForm                | 4 hours  | 🔴       |
| B-5 | Add ownership check to order confirmation page | 1 hour   | 🔴       |
| B-6 | Move WhatsApp phone to env var                 | 15 min   | 🔴       |
| H-1 | Send customer confirmation email               | 2 hours  | 🟠       |
| H-2 | Add coupon input to checkout UI                | 4 hours  | 🟠       |
| H-3 | Supabase client singleton                      | 30 min   | 🟠       |
| H-4 | Stock decrement on order                       | 1 hour   | 🟠       |
| H-5 | Collision-safe order numbers                   | 1 hour   | 🟠       |
| H-6 | Move notification email to env var             | 15 min   | 🟠       |
| M-1 | Env var validation at startup                  | 1 hour   | 🟡       |
| M-2 | Webhook idempotency                            | 2 hours  | 🟡       |
| M-3 | Write unit tests                               | 1 day    | 🟡       |
| M-4 | Replace `<img>` with `<Image>`                 | 2 hours  | 🟡       |
| M-5 | Pincode delivery zone check                    | 3 hours  | 🟡       |
| M-6 | Consolidate auth layer                         | 3 hours  | 🟡       |
| L-1 | Replace confirm() with modal                   | 1 hour   | 🟢       |
| L-2 | Sentry source maps                             | 1 hour   | 🟢       |
| L-3 | Fix robots.ts / sitemap.ts domain              | 15 min   | 🟢       |
| L-4 | Rate-limit remaining endpoints                 | 1 hour   | 🟢       |
| —   | Full deployment checklist                      | 1 day    | Ship     |

**Realistic timeline to ship:** 5–7 focused days of work.
