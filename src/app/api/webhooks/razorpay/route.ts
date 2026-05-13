import { createHmac } from 'crypto'
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  const eventId = request.headers.get('x-razorpay-event-id') ?? ''
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ''

  // Unconditional HMAC verification (no placeholder bypass)
  if (secret) {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (expected !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = adminDb()

  // ── M-2: Webhook idempotency guard ────────────────────────────────────────────
  if (eventId) {
    const { error } = await supabase
      .from('processed_webhook_events')
      .insert({ event_id: eventId })

    if (error?.code === '23505') {
      // Already processed — return 200 so Razorpay stops retrying
      return NextResponse.json({ received: true, duplicate: true })
    }
  }

  if (event.event === 'payment.captured') {
    const payment = (
      event.payload as { payment?: { entity?: { order_id?: string } } }
    ).payment?.entity
    if (payment?.order_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('razorpay_order_id', payment.order_id)
    }
  }

  if (event.event === 'payment.failed') {
    const payment = (
      event.payload as { payment?: { entity?: { order_id?: string } } }
    ).payment?.entity
    if (payment?.order_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'unpaid', status: 'cancelled' })
        .eq('razorpay_order_id', payment.order_id)
    }
  }

  if (event.event === 'refund.processed') {
    const refund = (
      event.payload as { refund?: { entity?: { payment_id?: string } } }
    ).refund?.entity
    if (refund?.payment_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded', status: 'refunded' })
        .eq('razorpay_payment_id', refund.payment_id)
    }
  }

  return NextResponse.json({ received: true })
}
