'use client'

import { useState } from 'react'
import Image from 'next/image'

type Image = { url: string; alt?: string }

type Props = {
  images: Image[]
  name: string
}

const GRADIENT_PLACEHOLDERS = [
  'linear-gradient(135deg, #8B5E3C 0%, #5C3D1E 100%)',
  'linear-gradient(135deg, #C8973A 0%, #8B5E3C 100%)',
  'linear-gradient(135deg, #3D1F0D 0%, #8B5E3C 100%)',
]

export function ProductImageGallery({ images, name }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  const active = images[activeIndex]

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-brand-cream"
        style={!active?.url ? { background: GRADIENT_PLACEHOLDERS[0] } : undefined}
      >
        {active?.url ? (
          <Image
            src={active.url}
            alt={active.alt ?? name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-display text-6xl italic text-brand-cream/20">{name[0]}</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                i === activeIndex
                  ? 'ring-2 ring-brand-gold ring-offset-1'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt ?? name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{ background: GRADIENT_PLACEHOLDERS[i % 3] }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
