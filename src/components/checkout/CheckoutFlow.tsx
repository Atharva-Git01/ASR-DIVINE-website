'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Session } from 'next-auth'
import { useCartStore } from '@/stores/cart'
import { CartReviewStep } from './CartReviewStep'
import { AddressStep } from './AddressStep'
import { PaymentStep } from './PaymentStep'

export type CheckoutAddress = {
  fullName: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

export type AppliedCoupon = {
  couponId: string
  code: string
  discountAmount: number
}

const STEPS = ['Cart', 'Address', 'Payment'] as const
type Step = 0 | 1 | 2

type Props = { session: Session | null }

export function CheckoutFlow({ session }: Props) {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>(0)
  const [address, setAddress] = useState<CheckoutAddress>({
    fullName: session?.user.name ?? '',
    phone: '',
    line1: '', line2: '', city: 'Pune', state: 'Maharashtra', pincode: '',
  })
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  if (items.length === 0 && !orderId) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-brand-text-secondary mb-4">Your cart is empty.</p>
        <a href="/shop" className="btn-primary inline-flex">Browse the shop</a>
      </div>
    )
  }

  function handleOrderSuccess(id: string) {
    clearCart()
    setOrderId(id)
    router.push(`/order/${id}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => {
          const done = step > i
          const active = step === i
          return (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                  style={{
                    background: done
                      ? 'var(--color-brown-deep)'
                      : active
                      ? 'var(--color-gold)'
                      : 'rgba(44,26,14,0.08)',
                    color: done || active ? 'white' : 'rgba(44,26,14,0.4)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span
                  className={`mt-1 text-[11px] font-medium ${
                    active ? 'text-brand-brown-deep' : 'text-brand-text-secondary'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className="flex-1 h-px mx-3 mt-[-10px]"
                  style={{
                    background:
                      step > i ? 'var(--color-brown-deep)' : 'rgba(44,26,14,0.10)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step content */}
      {step === 0 && (
        <CartReviewStep
          items={items}
          subtotal={subtotal()}
          coupon={coupon}
          onCouponApply={setCoupon}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <AddressStep
          address={address}
          onChange={setAddress}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
          session={session}
        />
      )}
      {step === 2 && (
        <PaymentStep
          items={items}
          subtotal={subtotal()}
          address={address}
          coupon={coupon}
          session={session}
          onBack={() => setStep(1)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  )
}
