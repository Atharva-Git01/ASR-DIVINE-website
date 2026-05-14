import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/ProductForm'

async function getProduct(id: string) {
  const { data } = await adminDb()
    .from('products')
    .select(
      'id, name, slug, description, base_price, category_id, is_active, is_eggless, is_seasonal, is_bestseller, stock_count, tags, serving_size, shelf_life, product_images(id, storage_path, alt_text, sort_order)'
    )
    .eq('id', id)
    .single()
  return data
}

async function getCategories() {
  const { data } = await adminDb().from('categories').select('id, name').order('name')
  return data ?? []
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProduct(params.id).catch(() => null),
    getCategories().catch(() => []),
  ])

  if (!product) notFound()

  const initial = {
    ...product,
    stock_count: product.stock_count != null ? String(product.stock_count) : '',
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    serving_size: product.serving_size ?? '',
    shelf_life: product.shelf_life ?? '',
    description: product.description ?? '',
    category_id: product.category_id ?? '',
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const initialImages = (
    (
      product as unknown as {
        product_images?: Array<{
          id: string
          storage_path: string
          alt_text: string | null
          sort_order: number
        }>
      }
    ).product_images ?? []
  ).map((img) => ({
    id: img.id,
    url: `${baseUrl}/storage/v1/object/public/product-images/${img.storage_path}`,
    altText: img.alt_text ?? '',
    sortOrder: img.sort_order,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors"
        >
          ← Products
        </Link>
        <h1 className="text-xl font-semibold text-brand-cream">{product.name}</h1>
      </div>
      <ProductForm
        categories={categories}
        initial={initial}
        initialImages={initialImages}
        isNew={false}
      />
    </div>
  )
}
