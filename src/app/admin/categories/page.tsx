import { adminDb } from '@/lib/supabase/admin'
import { CategoryManager } from '@/components/admin/CategoryManager'

async function getCategories() {
  const { data } = await adminDb()
    .from('categories')
    .select('id, name, slug, description, is_active')
    .order('name')
  return data ?? []
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories().catch(() => [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-brand-cream">Categories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  )
}
