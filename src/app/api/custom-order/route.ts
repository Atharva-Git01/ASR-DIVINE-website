import { NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const limited = await applyRateLimit(request, 'custom-order', { requests: 5, window: '1 m' })
  if (limited) return limited

  const formData = await request.formData()

  const fields = {
    orderType: formData.get('orderType') as string,
    occasion: formData.get('occasion') as string,
    guestCount: formData.get('guestCount') as string,
    flavour: formData.get('flavour') as string,
    designDescription: formData.get('designDescription') as string,
    dietaryNotes: formData.get('dietaryNotes') as string,
    deliveryDate: formData.get('deliveryDate') as string,
    deliveryType: formData.get('deliveryType') as string,
    budget: formData.get('budget') as string,
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
  }

  const resendKey = process.env.RESEND_API_KEY ?? ''
  if (!resendKey || resendKey === 're_placeholder') {
    // Dev mode — just log and return success
    console.log('[custom-order] Request received (email skipped, no Resend key):', fields)
    return NextResponse.json({ success: true })
  }

  const html = `
    <h2>New Custom Order Request</h2>
    <table cellpadding="6" style="border-collapse:collapse">
      ${Object.entries(fields)
        .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${v || '—'}</td></tr>`)
        .join('')}
    </table>
    <p>Check the admin panel for uploaded reference images.</p>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'orders@asrdivine.in',
      to: [process.env.BAKERY_NOTIFY_EMAIL ?? 'asrdivine2026@gmail.com'],
      reply_to: fields.email,
      subject: `Custom order request from ${fields.name} — ${fields.orderType} for ${fields.occasion || 'an occasion'}`,
      html,
    }),
  })

  if (!res.ok) {
    console.error('[custom-order] Resend error:', await res.text())
  }

  // Auto-reply to customer
  if (fields.email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'orders@asrdivine.in',
        to: [fields.email],
        subject: 'We received your custom order request — ASR Divine',
        html: `<p>Hi ${fields.name},</p>
               <p>Thank you for your custom order request! We've received your enquiry and will get back to you within 24 hours with a quote and availability.</p>
               <p>In the meantime, feel free to reach us on WhatsApp at +91 70709 19197.</p>
               <p>Warm regards,<br/>The ASR Divine team</p>`,
      }),
    }).catch(() => null)
  }

  return NextResponse.json({ success: true })
}
