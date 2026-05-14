import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'

async function getProducts() {
  const { data } = await adminDb()
    .from('products')
    .select(
      'id, name, slug, base_price, is_active, is_eggless, is_bestseller, stock_count, categories(name)'
    )
    .order('name')
  return data ?? []
}

export default async function AdminProductsPage() {
  const products = await getProducts().catch(() => [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-cream">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 rounded-xl text-sm font-medium text-brand-choc transition-all"
          style={{ background: 'var(--color-gold)' }}
        >
          + New product
        </Link>
      </div>

      <div
        className="rounded-2xl border overflow-x-auto"
        style={{ borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr
              className="border-b"
              style={{ background: 'rgba(200,151,58,0.05)', borderColor: 'rgba(200,151,58,0.10)' }}
            >
              {['Name', 'Category', 'Price', 'Stock', 'Status', 'Tags', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs text-brand-gold/50 font-medium tracking-wide uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-brand-gold/40">
                  No products yet.
                </td>
              </tr>
            )}
            {(
              products as Array<{
                id: string
                name: string
                slug: string
                base_price: number
                is_active: boolean
                is_eggless: boolean
                is_bestseller: boolean
                stock_count: number | null
                categories: { name: string } | { name: string }[] | null
              }>
            ).map((p) => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-brand-cream font-medium">{p.name}</p>
                  <p className="text-xs text-brand-gold/40">{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-xs text-brand-gold/60">
                  {(Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name) ??
                    '—'}
                </td>
                <td className="px-4 py-3 text-brand-gold font-medium">
                  ₹{p.base_price?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-xs text-brand-gold/60">{p.stock_count ?? '∞'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}
                  >
                    {p.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.is_eggless && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-sage/20 text-brand-sage">
                        Eggless
                      </span>
                    )}
                    {p.is_bestseller && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold">
                        ⭐ Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs text-brand-gold/60 hover:text-brand-gold transition-colors"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
