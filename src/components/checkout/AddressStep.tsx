'use client'

import { useState, useEffect } from 'react'
import type { Session } from 'next-auth'
import type { CheckoutAddress } from './CheckoutFlow'
import { trpc } from '@/lib/trpc/client'

type PincodeStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'ok'; message: string; extraCharge: number; deliveryType: 'local' | 'courier' }
  | { state: 'error'; message: string }

type Props = {
  address: CheckoutAddress
  onChange: (a: CheckoutAddress) => void
  onBack: () => void
  onNext: () => void
  session: Session | null
}

export function AddressStep({ address, onChange, onBack, onNext }: Props) {
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>({ state: 'idle' })

  const checkPincode = trpc.delivery.checkPincode.useQuery(
    { pincode: address.pincode },
    {
      enabled: /^\d{6}$/.test(address.pincode),
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 min
    },
  )

  // Sync query result → local status
  useEffect(() => {
    if (!address.pincode || address.pincode.length < 6) {
      setPincodeStatus({ state: 'idle' })
      return
    }
    if (!/^\d{6}$/.test(address.pincode)) return

    if (checkPincode.isFetching) {
      setPincodeStatus({ state: 'checking' })
      return
    }
    if (checkPincode.isError) {
      setPincodeStatus({ state: 'error', message: 'Could not check pincode. Please try again.' })
      return
    }
    if (checkPincode.data) {
      const result = checkPincode.data
      if (!result.serviceable) {
        setPincodeStatus({ state: 'error', message: result.message })
      } else {
        setPincodeStatus({
          state: 'ok',
          message: result.message,
          extraCharge: result.extraCharge,
          deliveryType: result.deliveryType,
        })
      }
    }
  }, [checkPincode.data, checkPincode.isFetching, checkPincode.isError, address.pincode])

  function set(field: keyof CheckoutAddress, value: string) {
    onChange({ ...address, [field]: value })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Block submission if pincode is not serviceable or still checking
    if (pincodeStatus.state === 'error' || pincodeStatus.state === 'checking') return
    onNext()
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-body font-semibold text-brand-brown-deep mb-6">Delivery address</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Full name *</label>
            <input
              type="text"
              value={address.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              required
              className="input"
              placeholder="Priya Sharma"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Phone *</label>
            <input
              type="tel"
              value={address.phone}
              onChange={(e) => set('phone', e.target.value)}
              required
              className="input"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-brand-text-secondary mb-1.5">Address line 1 *</label>
          <input
            type="text"
            value={address.line1}
            onChange={(e) => set('line1', e.target.value)}
            required
            className="input"
            placeholder="Flat / House no., Building, Street"
          />
        </div>

        <div>
          <label className="block text-xs text-brand-text-secondary mb-1.5">Address line 2</label>
          <input
            type="text"
            value={address.line2}
            onChange={(e) => set('line2', e.target.value)}
            className="input"
            placeholder="Area, Landmark"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">City *</label>
            <input
              type="text"
              value={address.city}
              onChange={(e) => set('city', e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">State *</label>
            <input
              type="text"
              value={address.state}
              onChange={(e) => set('state', e.target.value)}
              required
              className="input"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Pincode *</label>
            <input
              type="text"
              value={address.pincode}
              onChange={(e) => set('pincode', e.target.value)}
              required
              pattern="\d{6}"
              maxLength={6}
              inputMode="numeric"
              className={`input ${
                pincodeStatus.state === 'error'
                  ? 'border-red-400 focus:border-red-500'
                  : pincodeStatus.state === 'ok'
                  ? 'border-green-500 focus:border-green-600'
                  : ''
              }`}
              placeholder="411001"
            />
          </div>
        </div>

        {/* Pincode validation feedback */}
        {pincodeStatus.state === 'checking' && (
          <p className="text-xs text-brand-text-secondary flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-brand-gold/40 border-t-brand-gold rounded-full animate-spin" />
            Checking delivery availability…
          </p>
        )}
        {pincodeStatus.state === 'ok' && (
          <p className="text-xs text-green-600 flex items-center gap-1.5">
            <CheckIcon />
            {pincodeStatus.message}
            {pincodeStatus.extraCharge > 0 && (
              <span className="text-brand-text-secondary">
                {' '}(+₹{pincodeStatus.extraCharge} surcharge)
              </span>
            )}
          </p>
        )}
        {pincodeStatus.state === 'error' && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <XIcon />
            {pincodeStatus.message}
          </p>
        )}

        {/* Courier note */}
        {pincodeStatus.state === 'ok' && pincodeStatus.deliveryType === 'courier' && (
          <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <strong>Pan-India courier:</strong> Only dry items (chocolates, cookies) are available
            for courier delivery. Fresh cakes and bakery items require local Pune delivery.
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onBack} className="btn-ghost">← Back</button>
          <button
            type="submit"
            disabled={pincodeStatus.state === 'error' || pincodeStatus.state === 'checking'}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Payment →
          </button>
        </div>
      </form>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
