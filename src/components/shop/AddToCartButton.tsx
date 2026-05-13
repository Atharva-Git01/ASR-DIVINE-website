'use client'

import { useState } from 'react'
import { useCartStore } from '@/stores/cart'
import type { ShopProduct } from '@/types/product'

type Props = {
  product: Pick<ShopProduct, 'id' | 'name' | 'basePrice' | 'images'>
}

export function AddToCartButton({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images?.[0]?.url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full btn text-xs transition-all duration-200 ${
        added
          ? 'bg-brand-sage text-brand-white border-brand-sage'
          : 'btn-secondary'
      }`}
    >
      {added ? 'Added ✓' : 'Add to Cart'}
    </button>
  )
}
