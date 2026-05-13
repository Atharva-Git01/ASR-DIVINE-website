import type { MetadataRoute } from 'next'
import { adminDb } from '@/lib/supabase/admin'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cocoaandcrumb.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch product and category slugs from Supabase (no longer from Sanity — B-1)
  const [productsRes, categoriesRes] = await Promise.all([
    adminDb()
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('updated_at', { ascending: false }),
    adminDb()
      .from('categories')
      .select('slug, created_at')
      .eq('is_active', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE_URL}/shop`,          lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/gallery`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE_URL}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const productRoutes: MetadataRoute.Sitemap = (productsRes.data ?? []).map(
    (p: { slug: string; updated_at: string }) => ({
      url: `${BASE_URL}/shop/product/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })
  )

  const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data ?? []).map(
    (c: { slug: string; created_at: string }) => ({
      url: `${BASE_URL}/shop?category=${c.slug}`,
      lastModified: new Date(c.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    })
  )

  return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
