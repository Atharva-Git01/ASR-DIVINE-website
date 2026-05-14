import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'
import {
  computeOrderPricing,
  PricingError,
  totalsMatch,
  type PricingCartItem,
} from '@/lib/payment/pricing'
import { getRazorpayOrderConfig, RazorpayConfigError } from '@/lib/payment/razorpay'

type CreateOrderBody = {
  items?: PricingCartItem[]
  couponCode?: string | null
  currency?: string
  clientTotal?: number
}

function getRazorpayCredentials() {
  const { keyId, keySecret } = getRazorpayOrderConfig()
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  return { credentials }
}

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, 'payment-create-order', {
    requests: 10,
    window: '1 m',
  })
  if (limited) return limited

  let body: CreateOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const currency = body.currency ?? 'INR'
  if (currency !== 'INR') {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
  }

  try {
    const { credentials } = getRazorpayCredentials()
    const pricing = await computeOrderPricing({
      items: body.items ?? [],
      couponCode: body.couponCode,
    })

    if (!totalsMatch(body.clientTotal, pricing.total)) {
      return NextResponse.json(
        {
          error: 'Cart total changed. Please review your cart before paying.',
          serverTotal: pricing.total,
        },
        { status: 409 }
      )
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(pricing.total * 100),
        currency,
        receipt: `rcpt_${Date.now()}`,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json(
        { error: err.error?.description ?? 'Razorpay error' },
        { status: 502 }
      )
    }

    const order = await res.json()
    return NextResponse.json({ orderId: order.id, amount: pricing.total, currency })
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    if (err instanceof PricingError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    return NextResponse.json({ error: 'Could not create payment order' }, { status: 500 })
  }
}
