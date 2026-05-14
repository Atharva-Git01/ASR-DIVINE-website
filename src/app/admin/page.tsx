import { adminDb } from '@/lib/supabase/admin'
import { StatCard } from '@/components/admin/StatCard'
import Link from 'next/link'

const STATUS_COLOR: Record<string, string> = {
  pending: '#C8973A',
  confirmed: '#7A8C6E',
  in_preparation: '#7A8C6E',
  ready: '#7A8C6E',
  out_for_delivery: '#5C3D1E',
  delivered: '#7A8C6E',
  cancelled: '#dc2626',
}

async function getDashboardData() {
  const db = adminDb()
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [
    { data: revenueData },
    { count: totalOrders },
    { count: pendingOrders },
    { count: todayOrders },
    { data: recentOrders },
    { data: revenueByDay },
    { data: topProducts },
  ] = await Promise.all([
    db.from('orders').select('total').eq('payment_status', 'paid'),
    db.from('orders').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`),
    db
      .from('orders')
      .select('id, order_number, status, total, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    db
      .from('orders')
      .select('created_at, total')
      .eq('payment_status', 'paid')
      .gte('created_at', weekAgo)
      .order('created_at'),
    db
      .from('order_items')
      .select('product_name, quantity')
      .order('quantity', { ascending: false })
      .limit(5),
  ])

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0)

  // Aggregate revenue by day
  const dayMap: Record<string, number> = {}
  ;(revenueByDay ?? []).forEach((o) => {
    const day = o.created_at?.split('T')[0] ?? ''
    dayMap[day] = (dayMap[day] ?? 0) + (o.total ?? 0)
  })
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0]!
    return { day: d, rev: dayMap[d] ?? 0 }
  })
  const maxRev = Math.max(...last7Days.map((d) => d.rev), 1)

  // Aggregate top products
  const productMap: Record<string, number> = {}
  ;(topProducts ?? []).forEach(({ product_name, quantity }) => {
    productMap[product_name] = (productMap[product_name] ?? 0) + quantity
  })
  const topList = Object.entries(productMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return {
    totalRevenue,
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    todayOrders: todayOrders ?? 0,
    recentOrders: recentOrders ?? [],
    last7Days,
    maxRev,
    topList,
  }
}

export default async function AdminDashboard() {
  const {
    totalRevenue,
    totalOrders,
    pendingOrders,
    todayOrders,
    recentOrders,
    last7Days,
    maxRev,
    topList,
  } = await getDashboardData().catch(() => ({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0,
    recentOrders: [],
    last7Days: [],
    maxRev: 1,
    topList: [],
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-brand-cream">Dashboard</h1>
        <p className="text-sm text-brand-gold/50 mt-0.5">
          Welcome back. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          sub="All paid orders"
          accent
        />
        <StatCard label="Total Orders" value={totalOrders} sub="All time" />
        <StatCard label="Pending" value={pendingOrders} sub="Awaiting confirmation" />
        <StatCard label="Today" value={todayOrders} sub="Orders placed today" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Revenue chart */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
        >
          <h2 className="text-sm font-medium text-brand-cream mb-4">Revenue — last 7 days</h2>
          <div className="flex items-end gap-2 h-32">
            {last7Days.map(({ day, rev }) => {
              const h = Math.round((rev / maxRev) * 100)
              const label = new Date(day + 'T12:00:00').toLocaleDateString('en-IN', {
                weekday: 'short',
              })
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-brand-gold/50">
                    {rev > 0 ? `₹${(rev / 1000).toFixed(1)}k` : ''}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max(h, 2)}%`,
                      background: rev > 0 ? 'var(--color-gold)' : 'rgba(200,151,58,0.15)',
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-[9px] text-brand-gold/40">{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top products */}
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
        >
          <h2 className="text-sm font-medium text-brand-cream mb-4">Top products</h2>
          {topList.length === 0 ? (
            <p className="text-xs text-brand-gold/40">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topList.map(([name, qty], i) => {
                const maxQty = topList[0]?.[1] ?? 1
                return (
                  <div key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-brand-cream/80 truncate pr-2">{name}</span>
                      <span className="text-brand-gold flex-shrink-0">{qty} sold</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ background: 'rgba(200,151,58,0.15)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(qty / maxQty) * 100}%`,
                          background: i === 0 ? 'var(--color-gold)' : 'rgba(200,151,58,0.5)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div
        className="rounded-2xl border"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'rgba(200,151,58,0.08)' }}
        >
          <h2 className="text-sm font-medium text-brand-cream">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-brand-gold/60 hover:text-brand-gold transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-6 text-xs text-brand-gold/40">No orders yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
            {recentOrders.map(
              (order: {
                id: string
                order_number: string
                status: string
                total: number
                created_at: string
              }) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-sm text-brand-cream">{order.order_number}</p>
                    <p className="text-xs text-brand-gold/40">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: `${STATUS_COLOR[order.status] ?? '#8B5E3C'}18`,
                        color: STATUS_COLOR[order.status] ?? '#8B5E3C',
                      }}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium text-brand-gold">
                      ₹{order.total?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
