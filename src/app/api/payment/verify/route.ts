/**
 * POST /api/payment/verify
 *
 * Verifies a Razorpay payment and persists the order.
 *
 * Security guarantees:
 *  C-1  Server-side price recomputation: client-supplied prices/totals are ignored.
 *  C-2  Idempotency: a processed_payments row is inserted before order creation.
 *  C-3  Unconditional HMAC verification: payment signatures always use Razorpay secrets.
 */

import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import Razorpay from 'razorpay'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { applyRateLimit } from '@/lib/rate-limit'
import { computeOrderPricing, PricingError, type PricingCartItem } from '@/lib/payment/pricing'
import {
  getRazorpayOrderConfig,
  RazorpayConfigError,
  verifyPaymentSignature,
} from '@/lib/payment/razorpay'

function getRazorpayClient(): Razorpay {
  const { keyId, keySecret } = getRazorpayOrderConfig()
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

async function generateOrderNumber(): Promise<string> {
  const supabase = adminDb()
  const { data } = await supabase.rpc('generate_order_number')
  return (
    (data as string | null) ??
    `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
      .toString()
      .slice(-5)}`
  )
}

interface CartItem extends PricingCartItem {
  name: string
  variantLabel?: string
  giftMessage?: string
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
  couponCode?: string | null
}

export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, 'payment-verify', { requests: 20, window: '1 m' })
  if (limited) return limited

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
    couponCode = null,
  } = body

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json({ error: 'Missing Razorpay fields' }, { status: 400 })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  let keySecret: string
  try {
    keySecret = getRazorpayOrderConfig().keySecret
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    throw err
  }

  if (
    !verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      secret: keySecret,
    })
  ) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  let pricing
  try {
    pricing = await computeOrderPricing({ items, couponCode })
  } catch (err) {
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    throw err
  }

  let razorpayAmountINR: number
  try {
    const razorpay = getRazorpayClient()
    const payment = await razorpay.payments.fetch(razorpayPaymentId)
    razorpayAmountINR = (payment.amount as number) / 100
  } catch (err) {
    console.error('[verify] Razorpay payment fetch error', err)
    return NextResponse.json({ error: 'Could not verify payment amount' }, { status: 502 })
  }

  if (Math.abs(razorpayAmountINR - pricing.total) > 0.5) {
    console.error(
      `[verify] Amount mismatch: Razorpay ₹${razorpayAmountINR} vs server ₹${pricing.total}`
    )
    return NextResponse.json(
      {
        error: 'Payment amount does not match order total',
        expected: pricing.total,
        received: razorpayAmountINR,
      },
      { status: 400 }
    )
  }

  const supabase = adminDb()
  const { error: idempotencyError } = await supabase
    .from('processed_payments')
    .insert({ razorpay_payment_id: razorpayPaymentId })

  if (idempotencyError) {
    const alreadyProcessed =
      idempotencyError.code === '23505' ||
      idempotencyError.message?.toLowerCase().includes('duplicate')

    if (!alreadyProcessed) {
      console.error('[verify] idempotency insert error', idempotencyError)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }

    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('razorpay_payment_id', razorpayPaymentId)
      .maybeSingle()

    return NextResponse.json({ internalOrderId: existing?.id ?? null, duplicate: true })
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  }).catch(() => null)

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
      subtotal: pricing.subtotal,
      delivery_charge: pricing.deliveryCharge,
      discount_amount: pricing.discountAmount,
      total: pricing.total,
      currency: 'INR',
      coupon_code: pricing.coupon?.code ?? null,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      metadata: { address, giftWrapCharges: pricing.giftWrapCharges },
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('[verify] order insert error', orderError)
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 })
  }

  const orderItems = items.map((item, index) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: pricing.lines[index]?.variantId ?? null,
    product_name: item.name,
    variant_label: item.variantLabel ?? null,
    unit_price: pricing.lines[index]?.unitPrice ?? 0,
    quantity: item.qty,
    gift_wrap: item.giftWrapped,
    gift_message: item.giftMessage ?? null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) {
    console.error('[verify] order_items insert error', itemsError)
  }

  void (async () => {
    for (const item of items) {
      await supabase
        .rpc('decrement_stock', { p_product_id: item.productId, p_qty: item.qty })
        .then(({ error }) => {
          if (error) console.error('[verify] decrement_stock error', error)
        })
    }
  })()

  if (pricing.coupon) {
    void supabase.rpc('increment_coupon_used', { p_coupon_id: pricing.coupon.id })
  }

  void fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/order-placed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: order.id, orderNumber }),
  }).catch(() => null)

  return NextResponse.json({ internalOrderId: order.id })
}
