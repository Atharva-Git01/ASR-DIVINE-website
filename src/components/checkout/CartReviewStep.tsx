'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart'
import { trpc } from '@/lib/trpc/client'
import type { CartItem } from '@/stores/cart'
import type { AppliedCoupon } from './CheckoutFlow'

const DELIVERY_THRESHOLD = 999
const DELIVERY_CHARGE = 80

type Props = {
  items: CartItem[]
  subtotal: number
  coupon: AppliedCoupon | null
  onCouponApply: (coupon: AppliedCoupon | null) => void
  onNext: () => void
}

export function CartReviewStep({ items, subtotal, coupon, onCouponApply, onNext }: Props) {
  const { updateQty, removeItem, toggleGiftWrap } = useCartStore()
  const [couponCode, setCouponCode] = useState(coupon?.code ?? '')
  const [couponError, setCouponError] = useState<string | null>(null)

  const deliveryCharge = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const discountAmount = coupon?.discountAmount ?? 0
  const total = subtotal + deliveryCharge - discountAmount

  const validateCoupon = trpc.coupons.validate.useMutation({
    onSuccess(data) {
      onCouponApply({
        couponId: data.couponId,
        code: data.code,
        discountAmount: data.discountAmount,
      })
      setCouponError(null)
    },
    onError(err) {
      setCouponError(err.message)
      onCouponApply(null)
    },
  })

  function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponError(null)
    validateCoupon.mutate({ code: couponCode.trim(), subtotal })
  }

  function handleRemoveCoupon() {
    onCouponApply(null)
    setCouponCode('')
    setCouponError(null)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr,320px] items-start">
      {/* Items */}
      <div className="space-y-4">
        <h2 className="font-body font-semibold text-brand-brown-deep">Review your order</h2>
        {items.map((item) => (
          <div key={item.id} className="card p-4 flex gap-4 items-start">
            {/* Thumbnail */}
            <div
              className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-brand-cream"
              style={
                !item.image
                  ? { background: 'linear-gradient(135deg, #8B5E3C, #5C3D1E)' }
                  : undefined
              }
            >
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-text-primary leading-snug">
                {item.name}
              </p>
              {item.variantLabel && (
                <p className="text-xs text-brand-text-secondary">{item.variantLabel}</p>
              )}
              <p className="text-sm font-semibold text-brand-brown-deep mt-0.5">
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </p>

              {/* Gift wrap */}
              <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.giftWrapped}
                  onChange={() => toggleGiftWrap(item.id)}
                  className="rounded"
                />
                <span className="text-xs text-brand-text-secondary">Gift wrap (+₹30)</span>
              </label>
            </div>

            {/* Qty + remove */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div
                className="flex items-center border rounded-lg overflow-hidden"
                style={{ borderColor: 'rgba(44,26,14,0.15)' }}
              >
                <button
                  onClick={() => updateQty(item.id, item.qty - 1)}
                  className="w-7 h-7 flex items-center justify-center text-brand-text-secondary hover:text-brand-brown-deep"
                >
                  −
                </button>
                <span className="w-6 text-center text-xs">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, item.qty + 1)}
                  className="w-7 h-7 flex items-center justify-center text-brand-text-secondary hover:text-brand-brown-deep"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-brand-text-secondary hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary + coupon */}
      <div className="space-y-4">
        {/* Coupon input */}
        <div className="card p-4">
          <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide mb-2">
            Coupon code
          </p>
          {coupon ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-brand-sage">
                  {coupon.code}
                </span>
                <span className="text-xs text-brand-text-secondary ml-2">
                  −₹{coupon.discountAmount.toLocaleString('en-IN')} applied
                </span>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="text-xs text-red-400 hover:text-red-600 transition-colors ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="WELCOME10"
                className="flex-1 rounded-lg border px-3 py-2 text-xs outline-none focus:border-brand-gold transition-colors"
                style={{ borderColor: 'rgba(44,26,14,0.15)' }}
              />
              <button
                onClick={handleApplyCoupon}
                disabled={validateCoupon.isPending || !couponCode.trim()}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-brand-brown-deep text-brand-cream disabled:opacity-50 transition-opacity"
              >
                {validateCoupon.isPending ? '…' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="mt-1.5 text-xs text-red-500">{couponError}</p>}
        </div>

        {/* Order summary */}
        <div className="card p-5 space-y-3">
          <h3 className="font-body font-semibold text-brand-brown-deep text-sm">Order summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-text-secondary">Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-sage">
                <span>Discount ({coupon!.code})</span>
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
            {deliveryCharge > 0 && (
              <p className="text-xs text-brand-text-secondary">
                Free delivery on orders over ₹{DELIVERY_THRESHOLD}
              </p>
            )}
          </div>
          <div
            className="border-t pt-3 flex justify-between font-semibold text-brand-brown-deep"
            style={{ borderColor: 'rgba(44,26,14,0.08)' }}
          >
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          <button onClick={onNext} className="btn-primary w-full justify-center mt-1">
            Continue to Address →
          </button>
        </div>
      </div>
    </div>
  )
}
