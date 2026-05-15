'use client'

import { useState } from 'react'
import { CustomOrderForm } from './CustomOrderForm'

export function CustomOrderPageClient() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      {/* Header — hidden once form is submitted */}
      {!submitted && (
        <div
          className="relative border-b pt-14 pb-12"
          style={{ borderColor: 'rgba(44,26,14,0.08)' }}
        >
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
            <p className="eyebrow mb-3 justify-center">Made for you</p>
            <h1 className="font-display text-display-md italic text-brand-brown-deep">
              Custom Order Request
            </h1>
            <p className="mt-4 text-base max-w-lg mx-auto text-brand-text-secondary">
              Tell us about your dream cake, chocolate box, or hamper. We&apos;ll get back to you
              within 24 hours with a quote and timeline.
            </p>
          </div>
        </div>
      )}

      {/* Form — centered when submitted */}
      <div className={`relative mx-auto max-w-3xl px-6 lg:px-12 ${submitted ? 'flex min-h-[60vh] items-center justify-center py-20' : 'py-14 lg:py-20'}`}>
        <CustomOrderForm onSubmitted={() => setSubmitted(true)} />
      </div>
    </>
  )
}
