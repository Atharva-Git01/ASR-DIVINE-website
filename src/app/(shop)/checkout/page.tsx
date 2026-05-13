import type { Metadata } from 'next'
import { getSession } from '@/lib/auth/session'
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const session = await getSession()

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="bg-brand-white border-b pt-14 pb-10" style={{ borderColor: 'rgba(44,26,14,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="eyebrow mb-2">Almost there</p>
          <h1 className="font-display text-display-sm text-brand-brown-deep italic">Checkout</h1>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <CheckoutFlow session={session} />
      </div>
    </div>
  )
}
