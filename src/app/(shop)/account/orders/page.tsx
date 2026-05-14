import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { adminDb } from '@/lib/supabase/admin'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#C8973A' },
  confirmed: { label: 'Confirmed', color: '#7A8C6E' },
  in_preparation: { label: 'In Preparation', color: '#7A8C6E' },
  ready: { label: 'Ready', color: '#7A8C6E' },
  out_for_delivery: { label: 'Out for Delivery', color: '#5C3D1E' },
  delivered: { label: 'Delivered', color: '#7A8C6E' },
  cancelled: { label: 'Cancelled', color: '#dc2626' },
  refunded: { label: 'Refunded', color: '#9ca3af' },
}

type OrderItem = {
  product_name: string
  quantity: number
}

type Order = {
  id: string
  order_number: string
  created_at: string
  status: string
  total: number
  order_items: OrderItem[]
}

export default async function OrdersPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect('/auth/signin?callbackUrl=/account/orders')

  const { data: orders, error } = await adminDb()
    .from('orders')
    .select('id, order_number, created_at, status, total, order_items(product_name, quantity)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[orders] fetch error', error)
  }

  const list = (orders ?? []) as Order[]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-body font-semibold text-brand-brown-deep mb-1">My Orders</h2>
        <p className="text-sm text-brand-text-secondary">Your order history with Cocoa & Crumb.</p>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-brand-text-secondary mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link href="/shop" className="btn-primary">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((order) => {
            const status = STATUS_LABEL[order.status] ?? { label: order.status, color: '#8B5E3C' }
            const itemSummary = order.order_items
              .map((i) => `${i.product_name} ×${i.quantity}`)
              .join(', ')
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })

            return (
              <Link
                key={order.id}
                href={`/order/${order.id}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-brand-text-secondary mb-0.5">Order</p>
                    <p className="text-sm font-medium text-brand-text-primary">
                      {order.order_number}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: `${status.color}18`, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-brand-text-secondary truncate">{itemSummary || 'No items'}</p>
                  <p className="font-semibold text-brand-brown-deep ml-4 flex-shrink-0">
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="mt-1 text-xs text-brand-text-secondary">{date}</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
