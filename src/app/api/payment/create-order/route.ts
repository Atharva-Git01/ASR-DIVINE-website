import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'

function getRazorpayClient() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!
  const keySecret = process.env.RAZORPAY_KEY_SECRET!
  const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  return { credentials }
}

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, 'payment-create-order', { requests: 10, window: '1 m' })
  if (limited) return limited

  const { amount, currency = 'INR' } = await request.json()

  if (!amount || typeof amount !== 'number' || amount < 1) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  // In test mode with placeholder keys, return a fake order ID so checkout UI renders
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
  if (keyId === 'rzp_test_placeholder' || !keyId) {
    return NextResponse.json({ orderId: `order_test_${Date.now()}` })
  }

  try {
    const { credentials } = getRazorpayClient()
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency,
        receipt: `rcpt_${Date.now()}`,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.description ?? 'Razorpay error' }, { status: 502 })
    }

    const order = await res.json()
    return NextResponse.json({ orderId: order.id })
  } catch {
    return NextResponse.json({ error: 'Could not create payment order' }, { status: 500 })
  }
}
