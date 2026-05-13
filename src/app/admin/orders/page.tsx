import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'

const STATUSES = ['all', 'pending', 'confirmed', 'in_preparation', 'ready', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_COLOR: Record<string, string> = {
  pending: '#C8973A', confirmed: '#7A8C6E', in_preparation: '#7A8C6E',
  ready: '#7A8C6E', out_for_delivery: '#C8973A', delivered: '#4ade80', cancelled: '#f87171',
}

async function getOrders(status?: string, search?: string) {
  const db = adminDb()
  let q = db
    .from('orders')
    .select('id, order_number, status, payment_status, total, created_at, user_id, guest_email')
    .order('created_at', { ascending: false })
    .limit(50)
  if (status && status !== 'all') q = q.eq('status', status)
  if (search) q = q.ilike('order_number', `%${search}%`)
  const { data } = await q
  return data ?? []
}

type PageProps = { searchParams: { status?: string; q?: string } }

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const orders = await getOrders(searchParams.status, searchParams.q).catch(() => [])
  const activeStatus = searchParams.status ?? 'all'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brand-cream">Orders</h1>
        <span className="text-sm text-brand-gold/50">{orders.length} shown</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s !== 'all' ? `?status=${s}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeStatus === s ? 'bg-brand-gold text-brand-choc' : 'text-brand-gold/50 hover:text-brand-gold'
            }`}
            style={activeStatus !== s ? { border: '1px solid rgba(200,151,58,0.20)' } : undefined}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(200,151,58,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ background: 'rgba(200,151,58,0.06)', borderColor: 'rgba(200,151,58,0.10)' }}>
              {['Order', 'Status', 'Payment', 'Total', 'Date', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-brand-gold/50 font-medium tracking-wide uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-brand-gold/40">No orders found.</td>
              </tr>
            )}
            {orders.map((o: { id: string; order_number: string; status: string; payment_status: string; total: number; created_at: string; guest_email?: string }) => (
              <tr key={o.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-brand-cream font-medium">{o.order_number}</p>
                  <p className="text-xs text-brand-gold/40">{o.guest_email ?? 'Registered user'}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLOR[o.status] ?? '#8B5E3C'}18`, color: STATUS_COLOR[o.status] ?? '#8B5E3C' }}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${o.payment_status === 'paid' ? 'text-green-400' : 'text-brand-gold/50'}`}>
                    {o.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-gold font-medium">₹{o.total?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-xs text-brand-gold/40">
                  {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-xs text-brand-gold/60 hover:text-brand-gold transition-colors">
                    View →
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
