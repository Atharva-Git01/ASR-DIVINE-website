import type { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'
import { FounderStory } from '@/components/about/FounderStory'
import { SourcingPhilosophy } from '@/components/about/SourcingPhilosophy'
import { Timeline } from '@/components/about/Timeline'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'From a passion for baking to a Pune studio — the story behind ASR Divine, our sourcing philosophy, and the people who make it all.',
  openGraph: {
    title: 'Our Story | ASR Divine',
    description:
      'The story behind ASR Divine — handcrafted sweets, cakes, and chocolates from our studio in Pune.',
  },
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <FounderStory />
      <SourcingPhilosophy />
      <Timeline />
    </>
  )
}
