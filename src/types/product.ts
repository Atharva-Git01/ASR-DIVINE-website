/**
 * Canonical product type used throughout the shop UI.
 * All data sources (Supabase query, tRPC response) are normalised to this
 * shape before being passed to components.
 */
export type ShopProduct = {
  /** Supabase UUID */
  id: string
  name: string
  /** URL-safe slug, e.g. "dark-chocolate-truffle-box" */
  slug: string
  basePrice: number
  description?: string
  /** Images with fully-qualified URLs (Supabase Storage CDN path already expanded) */
  images?: Array<{ url: string; alt?: string }>
  category?: { name: string; slug: string }
  tags?: string[]
  isEggless: boolean
  isSeasonal: boolean
  isBestseller: boolean
  variants?: Array<{ id?: string; label: string; priceDelta: number }>
  servingSize?: string
  shelfLife?: string
  allergens?: string[]
}

/**
 * Supabase DB row shape returned by the product select with joins.
 * Only used internally in queries.ts — consumers receive ShopProduct.
 */
export type SupabaseProductRow = {
  id: string
  name: string
  slug: string
  base_price: number
  description: string | null
  is_active: boolean
  is_eggless: boolean
  is_seasonal: boolean
  is_bestseller: boolean
  tags: string[]
  serving_size: string | null
  shelf_life: string | null
  categories: { name: string; slug: string } | null
  product_images: Array<{
    id: string
    storage_path: string
    alt_text: string | null
    sort_order: number
  }>
  product_variants: Array<{
    id: string
    label: string
    price_delta: number
    sort_order: number
    is_active: boolean
  }>
}
