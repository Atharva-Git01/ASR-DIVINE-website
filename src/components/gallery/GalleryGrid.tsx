'use client'

import { useState } from 'react'

type GalleryImage = {
  _id: string
  image?: { asset?: { url: string }; alt?: string }
  caption?: string
  category?: string
  featured?: boolean
}

type Props = {
  images: GalleryImage[]
}

const CATEGORIES = ['All', 'Chocolates', 'Cakes', 'Gifting', 'Behind the Scenes']

const GRADIENT_PLACEHOLDERS = [
  'linear-gradient(135deg, #8B5E3C 0%, #5C3D1E 100%)',
  'linear-gradient(135deg, #C8973A 0%, #8B5E3C 100%)',
  'linear-gradient(135deg, #3D1F0D 0%, #8B5E3C 100%)',
  'linear-gradient(135deg, #7A8C6E 0%, #5C3D1E 100%)',
  'linear-gradient(135deg, #5C3D1E 0%, #C8973A 100%)',
  'linear-gradient(135deg, #E8CDB5 0%, #C8973A 100%)',
]

export function GalleryGrid({ images }: Props) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    activeCategory === 'All' ? images : images.filter((img) => img.category === activeCategory)

  const closeLightbox = () => setLightboxIndex(null)

  return (
    <>
      {/* Category filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-150 ${
              activeCategory === cat
                ? 'bg-brand-brown-deep text-brand-cream'
                : 'border text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep'
            }`}
            style={activeCategory !== cat ? { borderColor: 'rgba(44,26,14,0.20)' } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-brand-text-secondary py-16">
          No images in this category yet.
        </p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 space-y-3">
          {filtered.map((img, i) => {
            const imageUrl = img.image?.asset?.url
            const imageAlt = img.image?.alt ?? img.caption ?? 'Gallery image'
            const gradient =
              GRADIENT_PLACEHOLDERS[i % GRADIENT_PLACEHOLDERS.length] ?? GRADIENT_PLACEHOLDERS[0]

            return (
              <button
                key={img._id}
                onClick={() => setLightboxIndex(i)}
                className="block w-full overflow-hidden rounded-xl group break-inside-avoid cursor-zoom-in"
                aria-label={`View ${imageAlt}`}
              >
                <div
                  className="relative overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ background: gradient }}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full"
                      style={{ paddingBottom: i % 3 === 0 ? '133%' : i % 3 === 1 ? '100%' : '75%' }}
                    />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-brand-brown-deep/0 group-hover:bg-brand-brown-deep/20 transition-colors duration-200 flex items-end p-3">
                    {img.caption && (
                      <p className="text-xs text-brand-cream opacity-0 group-hover:opacity-100 transition-opacity duration-200 leading-snug">
                        {img.caption}
                      </p>
                    )}
                  </div>

                  {img.featured && (
                    <div className="absolute top-2 right-2">
                      <span className="badge-gold text-[9px] px-1.5 py-0.5">Featured</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-brand-brown-deep/90 backdrop-blur-sm p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-brand-cream/70 hover:text-brand-cream transition-colors"
            aria-label="Close lightbox"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Prev / Next */}
          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex - 1)
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/70 hover:text-brand-cream transition-colors"
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          {lightboxIndex < filtered.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex + 1)
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-cream/70 hover:text-brand-cream transition-colors"
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}

          {/* Active image */}
          <div
            className="max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {filtered[lightboxIndex]?.image?.asset?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={filtered[lightboxIndex]!.image!.asset!.url}
                alt={filtered[lightboxIndex]?.image?.alt ?? 'Gallery image'}
                className="max-h-[80vh] w-auto rounded-2xl"
              />
            ) : (
              <div
                className="w-80 h-80 rounded-2xl"
                style={{
                  background: GRADIENT_PLACEHOLDERS[lightboxIndex % GRADIENT_PLACEHOLDERS.length],
                }}
              />
            )}
            {filtered[lightboxIndex]?.caption && (
              <p className="mt-3 text-sm text-brand-cream/70 text-center">
                {filtered[lightboxIndex]?.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
