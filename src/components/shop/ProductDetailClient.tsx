'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductImageGallery } from './ProductImageGallery'
import { ProductVariantSelector } from './ProductVariantSelector'
import { useCartStore } from '@/stores/cart'
import type { ShopProduct } from '@/types/product'

type Props = { product: ShopProduct }

export function ProductDetailClient({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(
    product.variants && product.variants.length > 0 ? 0 : null
  )
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const variant = selectedVariant !== null ? product.variants?.[selectedVariant] : null
  const price = product.basePrice + (variant?.priceDelta ?? 0)
  const images = product.images?.map((img) => ({ url: img.url, alt: img.alt })) ?? []

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: crypto.randomUUID(),
        productId: product.id,
        variantId: variant?.id ?? (selectedVariant !== null ? String(selectedVariant) : undefined),
        name: product.name,
        variantLabel: variant?.label,
        price,
        image: images[0]?.url,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  // Adapt variants to the shape ProductVariantSelector expects
  const variantsSelectorShape = product.variants?.map((v) => ({
    label: v.label,
    priceDelta: v.priceDelta,
  }))

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
      {/* Images */}
      <ProductImageGallery images={images} name={product.name} />

      {/* Details */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-brand-text-secondary">
          <Link href="/shop" className="hover:text-brand-brown-deep transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="hover:text-brand-brown-deep transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-brand-text-primary">{product.name}</span>
        </nav>

        {/* Title + badges */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {product.isEggless && <span className="badge-sage">Eggless</span>}
            {product.isSeasonal && <span className="badge-gold">Seasonal</span>}
          </div>
          <h1 className="font-display text-display-sm text-brand-brown-deep italic leading-tight">
            {product.name}
          </h1>
          {product.category && (
            <p className="mt-1 text-sm text-brand-text-secondary">{product.category.name}</p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-brand-brown-deep">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {variant && (
            <span className="text-sm text-brand-text-secondary">for {variant.label}</span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-brand-text-secondary leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Variants */}
        {variantsSelectorShape && variantsSelectorShape.length > 0 && (
          <ProductVariantSelector
            variants={variantsSelectorShape}
            basePrice={product.basePrice}
            selected={selectedVariant}
            onChange={setSelectedVariant}
          />
        )}

        {/* Quantity + Add to cart */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center border rounded-xl overflow-hidden"
            style={{ borderColor: 'rgba(44,26,14,0.15)' }}
          >
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 flex items-center justify-center text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium text-brand-text-primary">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 flex items-center justify-center text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="btn-primary flex-1 justify-center"
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>

        {/* WhatsApp custom order CTA */}
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BAKERY_PHONE ?? '919876543210'}?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20${encodeURIComponent(product.name)}.`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full justify-center gap-2"
        >
          <WhatsappIcon />
          Order via WhatsApp
        </a>

        {/* Meta info */}
        {(product.servingSize ?? product.shelfLife ?? (product.allergens && product.allergens.length > 0)) && (
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(44,26,14,0.03)', border: '1px solid rgba(44,26,14,0.06)' }}
          >
            {product.servingSize && (
              <div className="flex justify-between text-xs">
                <span className="text-brand-text-secondary">Serving size</span>
                <span className="text-brand-text-primary font-medium">{product.servingSize}</span>
              </div>
            )}
            {product.shelfLife && (
              <div className="flex justify-between text-xs">
                <span className="text-brand-text-secondary">Shelf life</span>
                <span className="text-brand-text-primary font-medium">{product.shelfLife}</span>
              </div>
            )}
            {product.allergens && product.allergens.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-brand-text-secondary">Allergens</span>
                <span className="text-brand-text-primary font-medium">{product.allergens.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(44,26,14,0.06)', color: 'rgba(44,26,14,0.6)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WhatsappIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
