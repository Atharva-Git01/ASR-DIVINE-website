import { notFound } from 'next/navigation'
import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'
import { OrderStatusUpdater } from '@/components/admin/OrderStatusUpdater'

async function getOrder(id: string) {
  const { data } = await adminDb().from('orders').select('*, order_items(*)').eq('id', id).single()
  return data
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id).catch(() => null)
  if (!order) notFound()

  const address = order.metadata?.address
  const items: Array<{
    product_name: string
    variant_label: string | null
    unit_price: number
    quantity: number
    gift_wrap: boolean
  }> = order.order_items ?? []

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors"
        >
          ← Orders
        </Link>
        <h1 className="text-xl font-semibold text-brand-cream">{order.order_number}</h1>
      </div>

      {/* Status updater */}
      <div
        className="rounded-2xl border p-5"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <p className="text-xs text-brand-gold/50 uppercase tracking-wide mb-3">Update Status</p>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Meta */}
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        {[
          { label: 'Status', value: order.status.replace(/_/g, ' ') },
          { label: 'Payment', value: order.payment_status },
          {
            label: 'Placed',
            value: new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          { label: 'Fulfillment', value: order.fulfillment_type },
          { label: 'Razorpay Order', value: order.razorpay_order_id ?? '—' },
          { label: 'Razorpay Payment', value: order.razorpay_payment_id ?? '—' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-3"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(200,151,58,0.08)',
            }}
          >
            <p className="text-xs text-brand-gold/40 mb-1">{label}</p>
            <p className="text-brand-cream text-xs font-medium truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <div
          className="px-5 py-3 border-b"
          style={{ background: 'rgba(200,151,58,0.05)', borderColor: 'rgba(200,151,58,0.08)' }}
        >
          <p className="text-xs text-brand-gold/50 uppercase tracking-wide font-medium">Items</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
          {items.map((item, i) => (
            <div key={i} className="px-5 py-3 flex justify-between items-center">
              <div>
                <p className="text-sm text-brand-cream">{item.product_name}</p>
                {item.variant_label && (
                  <p className="text-xs text-brand-gold/40">{item.variant_label}</p>
                )}
                {item.gift_wrap && <span className="text-xs text-brand-gold">🎁 Gift wrapped</span>}
              </div>
              <div className="text-right">
                <p className="text-xs text-brand-gold/40">×{item.quantity}</p>
                <p className="text-sm font-medium text-brand-gold">
                  ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div
        className="rounded-2xl border p-5 space-y-2 text-sm"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <div className="flex justify-between">
          <span className="text-brand-gold/50">Subtotal</span>
          <span className="text-brand-cream">₹{order.subtotal?.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-brand-gold/50">Delivery</span>
          <span className="text-brand-cream">
            {order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}
          </span>
        </div>
        <div
          className="flex justify-between font-semibold text-brand-gold pt-2 border-t"
          style={{ borderColor: 'rgba(200,151,58,0.10)' }}
        >
          <span>Total</span>
          <span>₹{order.total?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Address */}
      {address && (
        <div
          className="rounded-2xl border p-5 text-sm"
          style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,151,58,0.08)' }}
        >
          <p className="text-xs text-brand-gold/50 uppercase tracking-wide mb-2">
            Delivery Address
          </p>
          <p className="text-brand-cream font-medium">{address.fullName}</p>
          <p className="text-brand-gold/60">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </p>
          <p className="text-brand-gold/60">
            {address.city}, {address.state} – {address.pincode}
          </p>
          <p className="text-brand-gold/60">{address.phone}</p>
        </div>
      )}
    </div>
  )
}
