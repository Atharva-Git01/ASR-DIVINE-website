/**
 * Server-side Supabase product queries.
 * All functions return ShopProduct[] / ShopProduct and normalise DB rows.
 * Import these in Server Components only — they use adminDb().
 */

import { adminDb } from '@/lib/supabase/admin'
import type { ShopProduct, SupabaseProductRow } from '@/types/product'

// ── Column selection ───────────────────────────────────────────────────────────

export const PRODUCT_SELECT =
  '*, categories(name, slug), product_images(id, storage_path, alt_text, sort_order), product_variants(id, label, price_delta, sort_order, is_active)'

// ── Adapter ────────────────────────────────────────────────────────────────────

export function toShopProduct(row: SupabaseProductRow): ShopProduct {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const images = (row.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      url: img.storage_path.startsWith('http')
        ? img.storage_path // already absolute (e.g. seeded with full URL)
        : `${baseUrl}/storage/v1/object/public/product-images/${img.storage_path}`,
      alt: img.alt_text ?? undefined,
    }))

  const variants = (row.product_variants ?? [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((v) => ({ id: v.id, label: v.label, priceDelta: Number(v.price_delta) }))

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    basePrice: Number(row.base_price),
    description: row.description ?? undefined,
    images: images.length > 0 ? images : undefined,
    category: row.categories ?? undefined,
    tags: row.tags ?? [],
    isEggless: row.is_eggless,
    isSeasonal: row.is_seasonal,
    isBestseller: row.is_bestseller,
    variants: variants.length > 0 ? variants : undefined,
    servingSize: row.serving_size ?? undefined,
    shelfLife: row.shelf_life ?? undefined,
  }
}

// ── Queries ────────────────────────────────────────────────────────────────────

/**
 * All active products (for /shop page).
 */
export async function getAllProducts(): Promise<ShopProduct[]> {
  const { data, error } = await adminDb()
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('[products] getAllProducts error', error)
    return []
  }
  return (data as SupabaseProductRow[]).map(toShopProduct)
}

/**
 * Bestselling products (for home page section).
 */
export async function getBestsellers(limit = 4): Promise<ShopProduct[]> {
  const { data, error } = await adminDb()
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('is_bestseller', true)
    .order('name')
    .limit(limit)

  if (error) {
    console.error('[products] getBestsellers error', error)
    return []
  }
  return (data as SupabaseProductRow[]).map(toShopProduct)
}

/**
 * Single product by slug (for /shop/product/[slug]).
 * Returns null when not found or inactive.
 */
export async function getProductBySlug(slug: string): Promise<ShopProduct | null> {
  const { data, error } = await adminDb()
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    console.error('[products] getProductBySlug error', error)
    return null
  }
  return data ? toShopProduct(data as SupabaseProductRow) : null
}

/**
 * Related products in the same category (excluding the given product).
 */
export async function getRelatedProducts(
  categorySlug: string,
  excludeId: string,
  limit = 4
): Promise<ShopProduct[]> {
  const { data: cat } = await adminDb()
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .maybeSingle()

  if (!cat) return []

  const { data, error } = await adminDb()
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .eq('category_id', cat.id)
    .neq('id', excludeId)
    .order('name')
    .limit(limit)

  if (error) return []
  return (data as SupabaseProductRow[]).map(toShopProduct)
}

/**
 * All active category slugs — for generateStaticParams.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const { data } = await adminDb()
    .from('products')
    .select('slug')
    .eq('is_active', true)

  return (data ?? []).map((r: { slug: string }) => r.slug)
}
