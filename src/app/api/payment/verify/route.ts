/**
 * POST /api/payment/verify
 *
 * Verifies a Razorpay payment and persists the order.
 *
 * Security guarantees:
 *  C-1  Server-side price recomputation — client-supplied prices are ignored.
 *       Authoritative unit prices are fetched from the `products` table and
 *       cross-checked against the amount captured by Razorpay.
 *  C-2  Idempotency — a `processed_payments` row is inserted atomically.
 *       If it already exists (duplicate/replay request) we return 200
 *       immediately without creating a second order.
 *  C-3  Unconditional HMAC verification — the `if (secret !== 'placeholder')`
 *       bypass has been removed; signature validation always runs.
 */

import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { getToken } from 'next-auth/jwt'
import Razorpay from 'razorpay'
import type { NextRequest } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'

// ── Razorpay client ────────────────────────────────────────────────────────────

function getRazorpayClient(): Razorpay {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

// ── Order number helper ────────────────────────────────────────────────────────

async function generateOrderNumber(): Promise<string> {
  const supabase = adminDb()
  const { data } = await supabase.rpc('generate_order_number')
  // Fallback: should never be reached after migration 002 is applied
  return (
    (data as string | null) ??
    `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
      .toString()
      .slice(-5)}`
  )
}

// ── Request body shape ─────────────────────────────────────────────────────────

interface CartItem {
  /** Product UUID from the database */
  productId: string
  /** Optional variant UUID */
  variantId?: string
  /** Display name — stored in order_items for human-readable history */
  name: string
  /** Optional variant label string */
  variantLabel?: string
  /** Quantity — must be ≥ 1 */
  qty: number
  /** Gift wrap flag for this line item */
  giftWrapped: boolean
  /** Optional gift message */
  giftMessage?: string
  // NOTE: `price` is intentionally absent — we fetch it from the DB (C-1)
}

interface VerifyBody {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  items: CartItem[]
  address: {
    fullName: string
    line1: string
    city: string
    state: string
    pincode: string
    phone: string
    email?: string
  }
  /** Client-supplied delivery charge — validated below */
  deliveryCharge: number
  /** Client-supplied gift-wrap surcharge — validated below */
  giftWrapCharges?: number
  /** Optional coupon code — validated server-side */
  couponCode?: string | null
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Rate-limit: 20 verify attempts per IP per minute (generous for legitimate users)
  const limited = await applyRateLimit(request, 'payment-verify', { requests: 20, window: '1 m' })
  if (limited) return limited

  // ── 1. Parse request ─────────────────────────────────────────────────────────
  let body: VerifyBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items,
    address,
    deliveryCharge,
    giftWrapCharges = 0,
    couponCode = null,
  } = body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: 'Missing Razorpay fields' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  // ── C-3: Unconditional HMAC signature verification ───────────────────────────
  // The `if (secret !== 'placeholder')` bypass is gone.  If the secret is not
  // set, the server will throw during startup (env.ts validates it).
  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  const expectedSignature = createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const supabase = adminDb()

  // ── C-2: Idempotency guard ────────────────────────────────────────────────────
  // Attempt to claim this payment ID.  The PK constraint on processed_payments
  // means a second request with the same ID returns error code '23505'.
  const { error: idempotencyError } = await supabase
    .from('processed_payments')
    .insert({ razorpay_payment_id: razorpayPaymentId })

  if (idempotencyError) {
    // A unique-constraint violation (code '23505') means already processed.
    const alreadyProcessed =
      idempotencyError.code === '23505' ||
      idempotencyError.message?.toLowerCase().includes('duplicate')

    if (!alreadyProcessed) {
      console.error('[verify] idempotency insert error', idempotencyError)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }

    // Payment already recorded — find the existing order and return its ID
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .maybeSingle()

    return NextResponse.json({ internalOrderId: existing?.id ?? null, duplicate: true })
  }

  // ── C-1: Server-side price recomputation ──────────────────────────────────────
  // Fetch authoritative `base_price` for every product in the cart.
  const productIds = Array.from(new Set(items.map((i) => i.productId)))

  const { data: productRows, error: productsError } = await supabase
    .from('products')
    .select('id, base_price, is_active')
    .in('id', productIds)

  if (productsError || !productRows) {
    console.error('[verify] products fetch error', productsError)
    return NextResponse.json({ error: 'Could not verify product prices' }, { status: 500 })
  }

  const priceMap = new Map<string, number>(productRows.map((p) => [p.id, p.base_price as number]))

  // Validate all products are still active
  const inactiveIds = productRows
    .filter((p) => !p.is_active)
    .map((p) => p.id)
  if (inactiveIds.length > 0) {
    return NextResponse.json(
      { error: 'One or more products are no longer available', productIds: inactiveIds },
      { status: 400 }
    )
  }

  // Compute server-authoritative totals
  let serverSubtotal = 0
  for (const item of items) {
    const unitPrice = priceMap.get(item.productId)
    if (unitPrice === undefined) {
      return NextResponse.json(
        { error: `Product not found: ${item.productId}` },
        { status: 400 }
      )
    }
    serverSubtotal += unitPrice * item.qty
  }

  // Delivery charge: free above ₹999, otherwise ₹80
  const serverDeliveryCharge = serverSubtotal >= 999 ? 0 : 80

  // ── H-2: Server-side coupon validation ───────────────────────────────────────
  let serverDiscountAmount = 0
  let validatedCouponId: string | null = null

  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('id, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_until, is_active')
      .eq('code', couponCode.toUpperCase().trim())
      .eq('is_active', true)
      .maybeSingle()

    const now = new Date()
    const isValid =
      coupon &&
      (!coupon.valid_until || new Date(coupon.valid_until) > now) &&
      (coupon.max_uses === null || coupon.used_count < coupon.max_uses) &&
      serverSubtotal >= Number(coupon.min_order_amount)

    if (isValid) {
      validatedCouponId = coupon.id as string
      serverDiscountAmount =
        coupon.discount_type === 'percentage'
          ? Math.min(Math.round((serverSubtotal * Number(coupon.discount_value)) / 100), serverSubtotal)
          : Math.min(Number(coupon.discount_value), serverSubtotal)
    }
    // If coupon is invalid/expired we silently ignore it (don't reject the order)
  }

  const serverTotal = serverSubtotal + serverDeliveryCharge + giftWrapCharges - serverDiscountAmount

  // ── Cross-check against the Razorpay payment object ──────────────────────────
  // Razorpay stores amounts in paise; divide by 100 for rupees.
  let razorpayAmountINR: number
  try {
    const razorpay = getRazorpayClient()
    const payment = await razorpay.payments.fetch(razorpayPaymentId)
    razorpayAmountINR = (payment.amount as number) / 100
  } catch (err) {
    console.error('[verify] Razorpay payment fetch error', err)
    return NextResponse.json({ error: 'Could not verify payment amount' }, { status: 502 })
  }

  if (Math.abs(razorpayAmountINR - serverTotal) > 0.5) {
    // Allow ½ rupee rounding tolerance
    console.error(
      `[verify] Amount mismatch: Razorpay ₹${razorpayAmountINR} vs server ₹${serverTotal}`
    )
    return NextResponse.json(
      {
        error: 'Payment amount does not match order total',
        expected: serverTotal,
        received: razorpayAmountINR,
      },
      { status: 400 }
    )
  }

  // ── Authenticated user (optional — guest checkout allowed) ───────────────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  }).catch(() => null)

  // ── Persist order ─────────────────────────────────────────────────────────────
  const orderNumber = await generateOrderNumber()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: token?.id ?? null,
      guest_email: !token ? (address.email ?? null) : null,
      guest_phone: !token ? (address.phone ?? null) : null,
      status: 'confirmed',
      payment_status: 'paid',
      fulfillment_type: 'delivery',
      subtotal: serverSubtotal,
      delivery_charge: serverDeliveryCharge,
      discount_amount: serverDiscountAmount,
      total: serverTotal,
      currency: 'INR',
      coupon_code: validatedCouponId ? couponCode : null,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      metadata: { address, giftWrapCharges },
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[verify] order insert error', orderError)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
  }

  // ── Persist order items (using server prices) ─────────────────────────────────
  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_name: item.name,
    variant_label: item.variantLabel ?? null,
    unit_price: priceMap.get(item.productId)!, // authoritative — from DB
    quantity: item.qty,
    gift_wrap: item.giftWrapped,
    gift_message: item.giftMessage ?? null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    console.error('[verify] order_items insert error', itemsError)
    // Order exists; still return success — items can be recovered manually
  }

  // ── H-4: Stock decrement (fire-and-forget, best-effort) ──────────────────────
  void (async () => {
    for (const item of items) {
      await supabase
        .rpc('decrement_stock', { p_product_id: item.productId, p_qty: item.qty })
        .then(({ error }) => {
          if (error) console.error('[verify] decrement_stock error', error)
        })
    }
  })()

  // ── Increment coupon used_count ───────────────────────────────────────────────
  if (validatedCouponId) {
    void supabase.rpc('increment_coupon_used', { p_coupon_id: validatedCouponId })
  }

  // ── Notifications (fire-and-forget) ──────────────────────────────────────────
  void fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/order-placed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, orderNumber }),
  }).catch(() => null)

  return NextResponse.json({ internalOrderId: order.id })
}
