import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import {
  getRazorpayWebhookSecret,
  RazorpayConfigError,
  verifyWebhookSignature,
} from '@/lib/payment/razorpay'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''
  const eventId = request.headers.get('x-razorpay-event-id') ?? ''

  let secret: string
  try {
    secret = getRazorpayWebhookSecret()
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    throw err
  }

  if (!signature || !verifyWebhookSignature({ rawBody, signature, secret })) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = adminDb()

  if (eventId) {
    const { error } = await supabase.from('processed_webhook_events').insert({ event_id: eventId })

    if (error?.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    if (error) {
      console.error('[razorpay webhook] idempotency insert error', error)
      return NextResponse.json({ error: 'Could not record webhook event' }, { status: 500 })
    }
  }

  if (event.event === 'payment.captured') {
    const payment = (event.payload as { payment?: { entity?: { order_id?: string } } }).payment
      ?.entity
    if (payment?.order_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('razorpay_order_id', payment.order_id)
    }
  }

  if (event.event === 'payment.failed') {
    const payment = (event.payload as { payment?: { entity?: { order_id?: string } } }).payment
      ?.entity
    if (payment?.order_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'unpaid', status: 'cancelled' })
        .eq('razorpay_order_id', payment.order_id)
    }
  }

  if (event.event === 'refund.processed') {
    const refund = (event.payload as { refund?: { entity?: { payment_id?: string } } }).refund
      ?.entity
    if (refund?.payment_id) {
      await supabase
        .from('orders')
        .update({ payment_status: 'refunded', status: 'refunded' })
        .eq('razorpay_payment_id', refund.payment_id)
    }
  }

  return NextResponse.json({ received: true })
}
