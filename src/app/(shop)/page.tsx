import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { BestsellersSection } from '@/components/home/BestsellersSection'

export const metadata: Metadata = {
  title: 'Cocoa & Crumb — Artisan Chocolates & Baked Goods, Pune',
  description:
    'Handcrafted bean-to-bar chocolates, celebration cakes, and curated gift hampers made in Pune. Order online with same-day delivery.',
  openGraph: {
    title: 'Cocoa & Crumb — Artisan Chocolates & Baked Goods, Pune',
    description:
      'Handcrafted bean-to-bar chocolates, celebration cakes, and curated gift hampers made in Pune.',
    url: 'https://cocoaandcrumb.in',
    siteName: 'Cocoa & Crumb',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryStrip />
      <BestsellersSection />
    </>
  )
}
