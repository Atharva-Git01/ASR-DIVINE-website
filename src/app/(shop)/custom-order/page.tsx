import type { Metadata } from 'next'
import { CustomOrderForm } from '@/components/custom-order/CustomOrderForm'

export const metadata: Metadata = {
  title: 'Custom Order',
  description:
    'Request a custom celebration cake, personalised chocolate box, or bespoke gifting hamper from Cocoa & Crumb.',
}

export default function CustomOrderPage() {
  return (
    <div className="bg-brand-cream min-h-screen">
      <div
        className="bg-brand-white border-b pt-14 pb-12"
        style={{ borderColor: 'rgba(44,26,14,0.08)' }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
          <p className="eyebrow mb-3 justify-center">Made for you</p>
          <h1 className="font-display text-display-md text-brand-brown-deep italic">
            Custom Order Request
          </h1>
          <p className="mt-4 text-base text-brand-text-secondary max-w-lg mx-auto">
            Tell us about your dream cake, chocolate box, or hamper. We&apos;ll get back to you
            within 24 hours with a quote and timeline.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-14 lg:px-12 lg:py-20">
        <CustomOrderForm />
      </div>
    </div>
  )
}
