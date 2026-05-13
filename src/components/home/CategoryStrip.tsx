import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'

type Category = {
  id: string
  name: string
  slug: string
}

// Gradient fallbacks for when categories have no images yet
const CATEGORY_GRADIENTS: Record<number, string> = {
  0: 'from-[#5C3D1E] to-[#3D1F0D]',
  1: 'from-[#C8973A] to-[#8B5E3C]',
  2: 'from-[#3D1F0D] to-[#8B5E3C]',
  3: 'from-[#7A8C6E] to-[#5C3D1E]',
  4: 'from-[#8B5E3C] to-[#2C1A0E]',
  5: 'from-[#E8CDB5] to-[#C8973A]',
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Chocolates', slug: 'chocolates' },
  { id: '2', name: 'Celebration Cakes', slug: 'cakes' },
  { id: '3', name: 'Cookies & Bars', slug: 'cookies' },
  { id: '4', name: 'Gift Hampers', slug: 'gifting' },
  { id: '5', name: 'Seasonal', slug: 'seasonal' },
  { id: '6', name: 'Custom Orders', slug: 'custom' },
]

export async function CategoryStrip() {
  const { data } = await adminDb()
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')
    .limit(6)

  const display = data && data.length > 0
    ? (data as Category[]).slice(0, 6)
    : FALLBACK_CATEGORIES

  return (
    <section className="bg-brand-cream py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Browse by Category</p>
          <h2 className="font-display text-display-md text-brand-brown-deep italic">
            Something for every craving
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {display.map((cat, i) => {
            const href = `/shop?category=${cat.slug}`
            const gradient = CATEGORY_GRADIENTS[i % 6] ?? CATEGORY_GRADIENTS[0]

            return (
              <Link
                key={cat.id}
                href={href}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col justify-end p-4 transition-transform duration-200 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-deep/70 via-transparent to-transparent" />

                {/* Label */}
                <span className="relative z-10 text-sm font-medium text-brand-cream leading-snug">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
