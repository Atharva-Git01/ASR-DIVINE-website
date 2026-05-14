'use client'

import { useState } from 'react'
import type { Session } from 'next-auth'
import type { CartItem } from '@/stores/cart'
import type { CheckoutAddress, AppliedCoupon } from './CheckoutFlow'

declare global {
  interface Window {
    Razorpay: new (opts: RazorpayOptions) => { open(): void }
  }
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name: string; email: string; contact: string }
  theme: { color: string }
  handler: (response: {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }) => void
  modal: { ondismiss: () => void }
}

const DELIVERY_THRESHOLD = 999
const DELIVERY_CHARGE = 80

type Props = {
  items: CartItem[]
  subtotal: number
  address: CheckoutAddress
  coupon: AppliedCoupon | null
  session: Session | null
  onBack: () => void
  onSuccess: (orderId: string) => void
}

export function PaymentStep({
  items,
  subtotal,
  address,
  coupon,
  session,
  onBack,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const giftWrapCharges = items.filter((i) => i.giftWrapped).length * 30
  const deliveryCharge = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const discountAmount = coupon?.discountAmount ?? 0
  const total = subtotal + deliveryCharge + giftWrapCharges - discountAmount

  async function handlePayment() {
    setError(null)
    setLoading(true)

    try {
      // Load Razorpay script dynamically
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      const paymentItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        variantLabel: item.variantLabel,
        qty: item.qty,
        giftWrapped: item.giftWrapped,
        giftMessage: item.giftMessage,
      }))

      // Create Razorpay order on server using authoritative pricing
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: paymentItems,
          couponCode: coupon?.code ?? null,
          currency: 'INR',
          clientTotal: total,
        }),
      })
      const {
        orderId: razorpayOrderId,
        amount: serverAmount,
        currency,
        error: serverError,
      } = await res.json()
      if (serverError) throw new Error(serverError)

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: Math.round(serverAmount * 100),
        currency,
        name: 'Cocoa & Crumb',
        description: `Order for ${items.length} item${items.length > 1 ? 's' : ''}`,
        order_id: razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: session?.user.email ?? '',
          contact: address.phone,
        },
        theme: { color: '#C8973A' },
        handler: async (response) => {
          // Verify + create order in DB
          // Note: only send productId/qty/display fields — verify route fetches prices server-side
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: paymentItems,
              address,
              couponCode: coupon?.code ?? null,
            }),
          })
          const { internalOrderId, error: verifyError } = await verifyRes.json()
          if (verifyError) {
            setError(verifyError)
            setLoading(false)
            return
          }
          onSuccess(internalOrderId)
        },
        modal: { ondismiss: () => setLoading(false) },
      })

      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,300px] items-start">
      {/* Left — order summary */}
      <div className="space-y-6">
        <h2 className="font-body font-semibold text-brand-brown-deep">Review & Pay</h2>

        {/* Address recap */}
        <div className="card p-4">
          <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide mb-2">
            Delivering to
          </p>
          <p className="text-sm text-brand-text-primary font-medium">{address.fullName}</p>
          <p className="text-sm text-brand-text-secondary">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.state} –{' '}
            {address.pincode}
          </p>
          <p className="text-sm text-brand-text-secondary">{address.phone}</p>
        </div>

        {/* Items recap */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-brand-text-secondary">
                {item.name}
                {item.variantLabel ? ` (${item.variantLabel})` : ''} ×{item.qty}
                {item.giftWrapped && ' 🎁'}
              </span>
              <span className="font-medium text-brand-text-primary ml-4">
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onBack} className="btn-ghost">
            ← Back
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? 'Opening payment…' : `Pay ₹${total.toLocaleString('en-IN')}`}
          </button>
        </div>

        <p className="text-xs text-brand-text-secondary text-center">
          Secured by Razorpay. We accept UPI, cards, net banking & wallets.
        </p>
      </div>

      {/* Right — totals */}
      <div className="card p-5 space-y-2 lg:sticky lg:top-24">
        <h3 className="font-body font-semibold text-brand-brown-deep text-sm mb-3">Order total</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {giftWrapCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Gift wrap</span>
              <span>₹{giftWrapCharges}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-brand-sage">
              <span>Coupon ({coupon!.code})</span>
              <span>−₹{discountAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-brand-text-secondary">Delivery</span>
            <span>
              {deliveryCharge === 0 ? (
                <span className="text-brand-sage">Free</span>
              ) : (
                `₹${deliveryCharge}`
              )}
            </span>
          </div>
        </div>
        <div
          className="border-t pt-3 flex justify-between font-semibold text-brand-brown-deep text-sm"
          style={{ borderColor: 'rgba(44,26,14,0.08)' }}
        >
          <span>Total</span>
          <span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
