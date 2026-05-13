import type { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'
import { FounderStory } from '@/components/about/FounderStory'
import { SourcingPhilosophy } from '@/components/about/SourcingPhilosophy'
import { Timeline } from '@/components/about/Timeline'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'From a love of fine chocolate to a Pune studio — the story behind Cocoa & Crumb, our sourcing philosophy, and the people who make it all.',
  openGraph: {
    title: 'Our Story | Cocoa & Crumb',
    description:
      'The story behind Cocoa & Crumb — handcrafted chocolates and baked goods from our studio in Pune.',
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
