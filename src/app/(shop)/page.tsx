import type { Metadata } from 'next'
import { HeroSection } from '@/components/home/HeroSection'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { BestsellersSection } from '@/components/home/BestsellersSection'

export const metadata: Metadata = {
  title: 'ASR Divine — Infinity Taste Eternal Delight',
  description:
    'Discover handcrafted sweets, chocolates, and celebration cakes from ASR Divine, Pune.',
  openGraph: {
    title: 'ASR Divine — Infinity Taste Eternal Delight',
    description:
      'Discover handcrafted sweets, chocolates, and celebration cakes from ASR Divine, Pune.',
    url: 'https://asrdivine.in',
    siteName: 'ASR Divine',
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
