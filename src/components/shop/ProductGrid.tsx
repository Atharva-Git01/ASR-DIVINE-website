'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from './AddToCartButton'
import type { ShopProduct } from '@/types/product'

type Category = { id: string; name: string; slug: string }

type Props = {
  products: ShopProduct[]
  categories: Category[]
}

const DIETARY_FILTERS = [
  { key: 'eggless', label: 'Eggless' },
  { key: 'seasonal', label: 'Seasonal' },
]

const GRADIENT_PLACEHOLDERS = [
  'linear-gradient(135deg, #8B5E3C 0%, #5C3D1E 100%)',
  'linear-gradient(135deg, #C8973A 0%, #8B5E3C 100%)',
  'linear-gradient(135deg, #3D1F0D 0%, #8B5E3C 100%)',
  'linear-gradient(135deg, #7A8C6E 0%, #5C3D1E 100%)',
]

export function ProductGrid({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeDietary, setActiveDietary] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name')

  const filtered = useMemo(() => {
    let list = [...products]

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === activeCategory)
    }

    if (activeDietary.includes('eggless')) {
      list = list.filter((p) => p.isEggless)
    }

    if (activeDietary.includes('seasonal')) {
      list = list.filter((p) => p.isSeasonal)
    }

    list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice
      return a.name.localeCompare(b.name)
    })

    return list
  }, [products, activeCategory, activeDietary, sortBy])

  const toggleDietary = (key: string) => {
    setActiveDietary((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all ${
              activeCategory === 'all'
                ? 'bg-brand-brown-deep text-brand-cream'
                : 'border text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep'
            }`}
            style={activeCategory !== 'all' ? { borderColor: 'rgba(44,26,14,0.20)' } : undefined}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all ${
                activeCategory === cat.slug
                  ? 'bg-brand-brown-deep text-brand-cream'
                  : 'border text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep'
              }`}
              style={
                activeCategory !== cat.slug ? { borderColor: 'rgba(44,26,14,0.20)' } : undefined
              }
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {DIETARY_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleDietary(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeDietary.includes(key)
                  ? key === 'eggless'
                    ? 'bg-brand-sage text-white border-brand-sage'
                    : 'bg-brand-gold text-brand-choc border-brand-gold'
                  : 'text-brand-text-secondary'
              }`}
              style={
                !activeDietary.includes(key) ? { borderColor: 'rgba(44,26,14,0.15)' } : undefined
              }
            >
              {label}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs text-brand-text-secondary rounded-lg px-3 py-1.5 border bg-transparent cursor-pointer"
            style={{ borderColor: 'rgba(44,26,14,0.15)' }}
          >
            <option value="name">A → Z</option>
            <option value="price-asc">Price: Low</option>
            <option value="price-desc">Price: High</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-brand-text-secondary mb-6">
        Showing {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-brand-text-secondary">No products match your filters.</p>
          <button
            onClick={() => {
              setActiveCategory('all')
              setActiveDietary([])
            }}
            className="mt-4 text-xs text-brand-gold underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => {
            const imageUrl = product.images?.[0]?.url
            const imageAlt = product.images?.[0]?.alt ?? product.name
            const gradient = GRADIENT_PLACEHOLDERS[i % 4] ?? GRADIENT_PLACEHOLDERS[0]

            return (
              <article key={product.id} className="card group flex flex-col">
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div
                      className="h-full w-full flex items-center justify-center"
                      style={{ background: gradient }}
                    >
                      <span className="font-display text-4xl italic text-brand-cream/20">
                        {product.name[0]}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isEggless && <span className="badge-sage">Eggless</span>}
                    {product.isSeasonal && <span className="badge-gold">Seasonal</span>}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col px-4 pb-4">
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
                  {product.description && (
                    <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-medium text-brand-brown-deep">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                    {product.variants && product.variants.length > 0 && (
                      <span className="text-xs text-brand-text-secondary font-normal ml-1">
                        onwards
                      </span>
                    )}
                  </p>
                  <div className="mt-auto pt-4">
                    <AddToCartButton product={product} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
