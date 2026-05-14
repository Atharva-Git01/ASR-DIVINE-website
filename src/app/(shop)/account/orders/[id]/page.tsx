import Link from 'next/link'
import { notFound } from 'next/navigation'

const STATUS_STEPS = [
  'pending',
  'confirmed',
  'in_preparation',
  'ready',
  'out_for_delivery',
  'delivered',
]

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_preparation: 'In Preparation',
  ready: 'Ready for Collection',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Demo data — replaced by tRPC orders.byId once Supabase is live
const DEMO_ORDERS: Record<
  string,
  {
    id: string
    orderNumber: string
    createdAt: string
    status: string
    subtotal: number
    deliveryCharge: number
    total: number
    fulfillmentType: string
    deliveryAddress?: string
    items: Array<{
      name: string
      variantLabel?: string
      qty: number
      price: number
      giftWrap: boolean
    }>
  }
> = {
  'demo-1': {
    id: 'demo-1',
    orderNumber: 'CC-20260510-4821',
    createdAt: '2026-05-10T14:32:00Z',
    status: 'delivered',
    subtotal: 1598,
    deliveryCharge: 0,
    total: 1598,
    fulfillmentType: 'delivery',
    deliveryAddress: 'Flat 4B, Koregaon Park, Pune 411001',
    items: [
      { name: 'Dark Chocolate Truffle Box', qty: 1, price: 599, giftWrap: false },
      {
        name: 'Belgian Hazelnut Praline',
        variantLabel: 'Box of 12',
        qty: 2,
        price: 499,
        giftWrap: true,
      },
    ],
  },
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = DEMO_ORDERS[params.id]
  if (!order) notFound()

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="text-xs text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
          >
            ← Back to orders
          </Link>
          <h2 className="mt-2 font-body font-semibold text-brand-brown-deep">
            {order.orderNumber}
          </h2>
          <p className="text-xs text-brand-text-secondary">
            Placed{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-brand-gold/15 text-brand-gold flex-shrink-0">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="card p-5">
          <div className="flex items-center justify-between gap-1">
            {STATUS_STEPS.slice(0, 5).map((step, i) => {
              const done = currentStep >= i
              return (
                <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-colors"
                    style={{
                      borderColor: done ? 'var(--color-gold)' : 'rgba(44,26,14,0.15)',
                      background: done ? 'var(--color-gold)' : 'transparent',
                      color: done ? 'white' : 'rgba(44,26,14,0.3)',
                    }}
                  >
                    {done ? '✓' : null}
                  </div>
                  <span className="text-[10px] text-center text-brand-text-secondary leading-tight hidden sm:block">
                    {STATUS_LABEL[step]}
                  </span>
                  {i < 4 && (
                    <div
                      className="h-0.5 w-full absolute"
                      style={{ background: done ? 'var(--color-gold)' : 'rgba(44,26,14,0.1)' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items */}
      <div
        className="card divide-y"
        style={
          { '--tw-divide-opacity': 1, borderColor: 'rgba(44,26,14,0.06)' } as React.CSSProperties
        }
      >
        {order.items.map((item, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-brand-text-primary">{item.name}</p>
              {item.variantLabel && (
                <p className="text-xs text-brand-text-secondary">{item.variantLabel}</p>
              )}
              {item.giftWrap && <span className="text-xs text-brand-gold">🎁 Gift wrapped</span>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-brand-text-secondary">×{item.qty}</p>
              <p className="text-sm font-semibold text-brand-brown-deep">
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="card p-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-brand-text-secondary">Subtotal</span>
          <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-brand-text-secondary">Delivery</span>
          <span>{order.deliveryCharge === 0 ? 'Free' : `₹${order.deliveryCharge}`}</span>
        </div>
        <div
          className="flex justify-between text-sm font-semibold text-brand-brown-deep pt-2 border-t"
          style={{ borderColor: 'rgba(44,26,14,0.08)' }}
        >
          <span>Total</span>
          <span>₹{order.total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Delivery info */}
      {order.deliveryAddress && (
        <div className="card p-5">
          <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide mb-1">
            {order.fulfillmentType === 'delivery' ? 'Delivery address' : 'Pickup'}
          </p>
          <p className="text-sm text-brand-text-primary">{order.deliveryAddress}</p>
        </div>
      )}
    </div>
  )
}
