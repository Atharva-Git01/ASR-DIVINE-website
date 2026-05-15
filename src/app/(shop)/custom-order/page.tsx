import type { Metadata } from 'next'
import Image from 'next/image'
import { CustomOrderPageClient } from '@/components/custom-order/CustomOrderPageClient'
import { resolvePublicRootImage } from '@/lib/resolve-asset'

export const metadata: Metadata = {
  title: 'Custom Order',
  description:
    'Request a custom celebration cake, personalised chocolate box, or bespoke gifting hamper from ASR Divine.',
}

export default function CustomOrderPage() {
  const imgSrc = resolvePublicRootImage('custom-order')

  return (
    <div className="relative min-h-screen bg-brand-cream">
      {/* Full-page background image */}
      {imgSrc && (
        <Image
          src={imgSrc}
          alt="Custom Order"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      )}

      <CustomOrderPageClient />
    </div>
  )
}
