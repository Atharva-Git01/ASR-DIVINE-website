import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/ProductForm'

async function getCategories() {
  const { data } = await adminDb().from('categories').select('id, name').order('name')
  return data ?? []
}

export default async function NewProductPage() {
  const categories = await getCategories().catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors">← Products</Link>
        <h1 className="text-xl font-semibold text-brand-cream">New Product</h1>
      </div>
      <ProductForm categories={categories} isNew={true} />
    </div>
  )
}
