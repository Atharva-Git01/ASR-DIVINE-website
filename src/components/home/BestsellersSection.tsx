import Link from 'next/link'
import Image from 'next/image'
import { getBestsellers } from '@/lib/products/queries'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

const GRADIENT_PLACEHOLDERS = [
  'from-[#8B5E3C] to-[#5C3D1E]',
  'from-[#C8973A] to-[#8B5E3C]',
  'from-[#5C3D1E] to-[#3D1F0D]',
  'from-[#7A8C6E] to-[#5C3D1E]',
]

export async function BestsellersSection() {
  const products = await getBestsellers(4)

  if (products.length === 0) return null

  return (
    <section className="bg-brand-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-3">Fan Favourites</p>
            <h2 className="font-display text-display-sm sm:text-display-md text-brand-brown-deep italic">
              Our bestsellers
            </h2>
          </div>
          <Link href="/shop" className="btn btn-ghost text-sm self-start sm:self-auto">
            View all →
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => {
            const imageUrl = product.images?.[0]?.url
            const imageAlt = product.images?.[0]?.alt ?? product.name
            const gradient = GRADIENT_PLACEHOLDERS[i % 4] ?? GRADIENT_PLACEHOLDERS[0]

            return (
              <article key={product.id} className="card group flex flex-col">
                {/* Image */}
                <Link
                  href={`/shop/product/${product.slug}`}
                  className="block relative overflow-hidden rounded-xl aspect-square mb-4 bg-brand-cream"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div
                      className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
                    >
                      <span className="font-display text-4xl italic text-brand-cream/20">
                        {product.name[0]}
                      </span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isEggless && <span className="badge badge-sage">Eggless</span>}
                    {product.isSeasonal && <span className="badge badge-gold">Seasonal</span>}
                  </div>
                </Link>

                {/* Copy */}
                <div className="flex flex-1 flex-col">
                  {product.category && (
                    <p className="text-xs text-brand-text-secondary mb-1">
                      {product.category.name}
                    </p>
                  )}
                  <Link href={`/shop/product/${product.slug}`}>
                    <h3 className="font-body text-sm font-medium text-brand-text-primary hover:text-brand-brown-deep transition-colors leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="mt-2 text-sm font-medium text-brand-brown-deep">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </p>

                  {/* CTA */}
                  <div className="mt-4">
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
