import { adminDb } from '@/lib/supabase/admin'

type Order = { total: number; created_at: string; status: string; payment_status: string }
type OrderItem = { product_name: string; quantity: number; unit_price: number }

async function getAnalyticsData() {
  const db = adminDb()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [ordersResult, itemsResult] = await Promise.all([
    db.from('orders').select('total, created_at, status, payment_status').gte('created_at', thirtyDaysAgo),
    db.from('order_items').select('product_name, quantity, unit_price'),
  ])

  return {
    orders: (ordersResult.data ?? []) as Order[],
    items: (itemsResult.data ?? []) as OrderItem[],
  }
}

function buildDailyRevenue(orders: Order[]) {
  const map: Record<string, number> = {}
  for (const o of orders) {
    if (o.payment_status !== 'paid') continue
    const day = o.created_at.slice(0, 10)
    map[day] = (map[day] ?? 0) + (o.total ?? 0)
  }
  const days: { date: string; revenue: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, revenue: map[key] ?? 0 })
  }
  return days
}

function buildTopProducts(items: OrderItem[]) {
  const map: Record<string, { revenue: number; quantity: number }> = {}
  for (const item of items) {
    if (!map[item.product_name]) map[item.product_name] = { revenue: 0, quantity: 0 }
    map[item.product_name]!.revenue += item.unit_price * item.quantity
    map[item.product_name]!.quantity += item.quantity
  }
  return Object.entries(map)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
}

function buildFunnel(orders: Order[]) {
  const total = orders.length
  const paid = orders.filter((o) => o.payment_status === 'paid').length
  const delivered = orders.filter((o) => o.status === 'delivered').length
  const cancelled = orders.filter((o) => o.status === 'cancelled').length
  return { total, paid, delivered, cancelled }
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default async function AdminAnalyticsPage() {
  const { orders, items } = await getAnalyticsData().catch(() => ({ orders: [], items: [] }))

  const daily = buildDailyRevenue(orders)
  const topProducts = buildTopProducts(items)
  const funnel = buildFunnel(orders)

  const totalRevenue = daily.reduce((s, d) => s + d.revenue, 0)
  const maxRev = Math.max(...daily.map((d) => d.revenue), 1)

  const maxProductRev = Math.max(...topProducts.map((p) => p.revenue), 1)

  const periods = [7, 14, 30]
  const periodRevenue = periods.map((days) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    return {
      days,
      revenue: orders
        .filter((o) => o.payment_status === 'paid' && o.created_at >= cutoff)
        .reduce((s, o) => s + (o.total ?? 0), 0),
    }
  })

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-brand-cream">Analytics</h1>

      {/* Period summary */}
      <div className="grid grid-cols-3 gap-4">
        {periodRevenue.map(({ days, revenue }) => (
          <div key={days} className="rounded-2xl border p-4" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}>
            <p className="text-xs text-brand-gold/40 mb-1">Last {days} days</p>
            <p className="text-xl font-semibold text-brand-gold">₹{revenue.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* 30-day revenue bar chart */}
      <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-brand-cream">Daily revenue — last 30 days</p>
          <p className="text-xs text-brand-gold">₹{totalRevenue.toLocaleString('en-IN')} total</p>
        </div>
        <div className="flex items-end gap-px h-32">
          {daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col justify-end group relative">
              <div
                className="rounded-sm bg-brand-gold/40 group-hover:bg-brand-gold transition-colors"
                style={{ height: `${Math.max((d.revenue / maxRev) * 100, d.revenue > 0 ? 4 : 1)}%` }}
              />
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 whitespace-nowrap">
                <div className="rounded-lg px-2 py-1 text-[10px]" style={{ background: '#1a0f07', border: '1px solid rgba(200,151,58,0.20)' }}>
                  <p className="text-brand-gold/60">{shortDate(d.date)}</p>
                  <p className="text-brand-gold font-medium">₹{d.revenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-brand-gold/30">
          <span>{daily[0] ? shortDate(daily[0].date) : ''}</span>
          <span>{daily[daily.length - 1] ? shortDate(daily[daily.length - 1]!.date) : ''}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}>
          <p className="text-sm font-medium text-brand-cream mb-4">Top products by revenue</p>
          {topProducts.length === 0 ? (
            <p className="text-xs text-brand-gold/30">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-brand-cream/70 truncate max-w-[60%]">{p.name}</span>
                    <span className="text-brand-gold">₹{p.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-gold/50" style={{ width: `${(p.revenue / maxProductRev) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order funnel */}
        <div className="rounded-2xl border p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}>
          <p className="text-sm font-medium text-brand-cream mb-4">Order funnel — 30 days</p>
          <div className="space-y-3">
            {[
              { label: 'Total orders', value: funnel.total, pct: 100, color: 'bg-white/20' },
              { label: 'Paid', value: funnel.paid, pct: funnel.total ? (funnel.paid / funnel.total) * 100 : 0, color: 'bg-brand-gold/50' },
              { label: 'Delivered', value: funnel.delivered, pct: funnel.total ? (funnel.delivered / funnel.total) * 100 : 0, color: 'bg-green-500/40' },
              { label: 'Cancelled', value: funnel.cancelled, pct: funnel.total ? (funnel.cancelled / funnel.total) * 100 : 0, color: 'bg-red-500/30' },
            ].map(({ label, value, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-brand-cream/60">{label}</span>
                  <span className="text-brand-gold">{value} <span className="text-brand-gold/40">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
