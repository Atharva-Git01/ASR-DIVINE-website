import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/supabase/admin'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, 'order-notification', { requests: 30, window: '1 m' })
  if (limited) return limited

  const { orderId, orderNumber } = await request.json()

  // Fetch the order to get customer email + items for the receipt
  const { data: order } = await adminDb()
    .from('orders')
    .select('guest_email, user_id, total, metadata, order_items(product_name, quantity, unit_price)')
    .eq('id', orderId)
    .maybeSingle()

  // Resolve customer email: guest_email or look up from profiles
  let customerEmail: string | null = order?.guest_email ?? null
  if (!customerEmail && order?.user_id) {
    const { data: profile } = await adminDb()
      .from('profiles')
      .select('email:id')   // profiles has no email column; look up via auth join
      .eq('id', order.user_id)
      .maybeSingle()

    // The profiles table doesn't store email — pull from auth.users via RPC if needed.
    // For now, skip customer email when no guest_email is present; it's handled by
    // the NextAuth session and can be wired up in a future iteration.
    void profile // suppress unused warning
  }

  // Fire bakery email + WhatsApp + optional customer receipt in parallel
  const results = await Promise.allSettled([
    sendBakeryEmail(orderId, orderNumber),
    sendWhatsAppAlert(orderNumber),
    customerEmail ? sendCustomerReceipt(customerEmail, orderNumber, order) : Promise.resolve(),
  ])

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length > 0) {
    console.error('[notifications] Some notifications failed:', failed)
  }

  return NextResponse.json({ sent: results.length - failed.length })
}

// ── Bakery notification email ──────────────────────────────────────────────────

async function sendBakeryEmail(orderId: string, orderNumber: string) {
  const resendKey = process.env.RESEND_API_KEY ?? ''
  if (!resendKey || resendKey === 're_placeholder') return

  const bakeryEmail = process.env.BAKERY_NOTIFY_EMAIL ?? 'orders@cocoaandcrumb.in'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'orders@cocoaandcrumb.in',
      to: [bakeryEmail],
      subject: `New order ${orderNumber}`,
      html: `<p>Order <strong>${orderNumber}</strong> (ID: ${orderId}) has been placed and payment confirmed.</p>
             <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${orderId}">View in admin</a></p>`,
    }),
  })

  if (!res.ok) throw new Error(`Resend bakery email error: ${res.status}`)
}

// ── Customer receipt email (H-1) ──────────────────────────────────────────────

async function sendCustomerReceipt(
  customerEmail: string,
  orderNumber: string,
  order: {
    total: number
    metadata: { address?: { fullName?: string } }
    order_items: Array<{ product_name: string; quantity: number; unit_price: number }>
  } | null
) {
  const resendKey = process.env.RESEND_API_KEY ?? ''
  if (!resendKey || resendKey === 're_placeholder') return
  if (!order) return

  const customerName = order.metadata?.address?.fullName ?? 'there'
  const itemRows = order.order_items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;color:#5C3D1E">${i.product_name}</td>
          <td style="padding:6px 0;text-align:center;color:#666">×${i.quantity}</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;color:#5C3D1E">₹${(i.unit_price * i.quantity).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('')

  const html = `
    <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C1A0E">
      <h1 style="font-size:24px;font-style:italic;color:#5C3D1E">Thanks, ${customerName}! 🍫</h1>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed and our team is getting to work.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        ${itemRows}
        <tr style="border-top:1px solid #e8d9c8">
          <td colspan="2" style="padding:8px 0;font-weight:600">Total paid</td>
          <td style="padding:8px 0;text-align:right;font-weight:700;color:#5C3D1E">₹${Number(order.total).toLocaleString('en-IN')}</td>
        </tr>
      </table>
      <p style="font-size:13px;color:#888">We'll WhatsApp you when your order is ready. Questions? Reply to this email.</p>
      <p style="font-size:13px;color:#888">— The Cocoa & Crumb team</p>
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'orders@cocoaandcrumb.in',
      to: [customerEmail],
      subject: `Your Cocoa & Crumb order ${orderNumber} is confirmed 🍫`,
      html,
    }),
  })

  if (!res.ok) throw new Error(`Resend customer receipt error: ${res.status}`)
}

// ── WhatsApp bakery alert (B-6) ────────────────────────────────────────────────

async function sendWhatsAppAlert(orderNumber: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? ''
  const token = process.env.WHATSAPP_ACCESS_TOKEN ?? ''
  // B-6: use env var, not hardcoded placeholder number
  const bakeryPhone = process.env.WHATSAPP_BAKERY_PHONE ?? ''

  if (!phoneNumberId || phoneNumberId === 'placeholder') return
  if (!bakeryPhone) return

  const res = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: bakeryPhone,
        type: 'text',
        text: {
          body: `🎉 New order received: ${orderNumber}. Check the admin panel to confirm.`,
        },
      }),
    }
  )

  if (!res.ok) throw new Error(`WhatsApp error: ${res.status}`)
}
