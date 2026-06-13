import type { Metadata } from 'next'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'A lookbook of our handcrafted chocolates, celebration cakes, and gifting collections — made in our Pune studio.',
  openGraph: {
    title: 'Gallery | ASR Divine',
    description: 'A lookbook of handcrafted chocolates and baked goods from our Pune studio.',
  },
}

type GalleryImage = {
  _id: string
  image?: { asset?: { url: string }; alt?: string }
  caption?: string
  category?: string
  featured?: boolean
}

// Placeholder images until a gallery CMS is set up
const PLACEHOLDER_IMAGES: GalleryImage[] = Array.from({ length: 12 }, (_, i) => ({
  _id: `placeholder-${i}`,
  caption:
    [
      'Dark chocolate truffles',
      'Hazelnut praline close-up',
      'Wedding favour box',
      'Celebration fondant cake',
      'Gift hamper unboxing',
      'Bean-to-bar process',
      'Tempering table',
      'Custom cake design',
      'Packaging detail',
      'Seasonal collection',
      'Studio workspace',
      'Truffle making',
    ][i] ?? `Gallery ${i + 1}`,
  category: [
    'Chocolates',
    'Chocolates',
    'Gifting',
    'Cakes',
    'Gifting',
    'Behind the Scenes',
    'Behind the Scenes',
    'Cakes',
    'Gifting',
    'Chocolates',
    'Behind the Scenes',
    'Chocolates',
  ][i],
  featured: i < 3,
}))

export default function GalleryPage() {
  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Page header */}
      <div
        className="bg-brand-white border-b pt-14 pb-12"
        style={{ borderColor: 'rgba(44,26,14,0.08)' }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
          <p className="eyebrow mb-4 justify-center">Lookbook</p>
          <h1 className="font-display text-[1.75rem] sm:text-display-md text-brand-brown-deep italic">
            Made by hand, one piece at a time
          </h1>
          <p className="mt-4 text-base text-brand-text-secondary max-w-xl mx-auto">
            A glimpse into our studio — from bean to bar, and batter to celebration.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-20">
        <GalleryGrid images={PLACEHOLDER_IMAGES} />
      </div>
    </div>
  )
}
