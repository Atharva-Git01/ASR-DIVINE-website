import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProductBySlug, getRelatedProducts, getAllProductSlugs } from '@/lib/products/queries'
import { ProductDetailClient } from '@/components/shop/ProductDetailClient'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Product not found' }

  const imageUrl = product.images?.[0]?.url
  return {
    title: product.name,
    description: product.description ?? `${product.name} — handcrafted by ASR Divine, Pune.`,
    openGraph: {
      title: `${product.name} | ASR Divine`,
      description: product.description,
      images: imageUrl ? [{ url: imageUrl, width: 800, height: 800, alt: product.name }] : [],
    },
  }
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = product.category
    ? await getRelatedProducts(product.category.slug, product.id, 4)
    : []

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-16">
        <ProductDetailClient product={product} />

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20 pt-10 border-t" style={{ borderColor: 'rgba(44,26,14,0.08)' }}>
            <h2 className="font-display text-2xl italic text-brand-brown-deep mb-8">
              You might also like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => {
                const imgUrl = p.images?.[0]?.url
                return (
                  <Link key={p.id} href={`/shop/product/${p.slug}`} className="card group block">
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-brand-cream relative">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.images?.[0]?.alt ?? p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 25vw"
                        />
                      ) : (
                        <div
                          className="h-full w-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, #8B5E3C 0%, #5C3D1E 100%)',
                          }}
                        >
                          <span className="font-display text-3xl italic text-brand-cream/20">
                            {p.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="px-1 pb-1">
                      <p className="text-xs text-brand-text-secondary mb-0.5">{p.category?.name}</p>
                      <h3 className="text-sm font-medium text-brand-text-primary group-hover:text-brand-brown-deep transition-colors leading-snug">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-brand-brown-deep">
                        ₹{p.basePrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
