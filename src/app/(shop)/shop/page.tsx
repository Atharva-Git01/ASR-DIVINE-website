import type { Metadata } from 'next'
import { getAllProducts } from '@/lib/products/queries'
import { adminDb } from '@/lib/supabase/admin'
import { ProductGrid } from '@/components/shop/ProductGrid'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Browse our full range of handcrafted chocolates, celebration cakes, cookies, and gift hampers — all made in Pune.',
}

export default async function ShopPage() {
  const [products, categoriesRes] = await Promise.all([
    getAllProducts(),
    adminDb()
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const categories = (categoriesRes.data ?? []) as Array<{
    id: string
    name: string
    slug: string
  }>

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="bg-brand-white border-b pt-14 pb-12" style={{ borderColor: 'rgba(44,26,14,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="eyebrow mb-3">Full Menu</p>
          <h1 className="font-display text-display-md text-brand-brown-deep italic">
            Everything we make
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12 lg:py-16">
        <ProductGrid products={products} categories={categories} />
      </div>
    </div>
  )
}
