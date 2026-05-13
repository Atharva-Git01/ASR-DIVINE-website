import type { Metadata } from 'next'
import Link from 'next/link'
import { adminDb } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'

export const metadata: Metadata = {
  title: 'Order Confirmed',
  robots: { index: false, follow: false },
}

type OrderItem = {
  product_name: string
  variant_label: string | null
  unit_price: number
  quantity: number
  gift_wrap: boolean
}

type Order = {
  id: string
  order_number: string
  status: string
  payment_status: string
  subtotal: number
  delivery_charge: number
  total: number
  fulfillment_type: string
  created_at: string
  user_id: string | null
  order_items: OrderItem[]
  metadata: {
    address?: {
      fullName?: string
      line1?: string
      city?: string
      pincode?: string
    }
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending:        'Pending',
  confirmed:      'Confirmed',
  in_preparation: 'In Preparation',
  delivered:      'Delivered',
  cancelled:      'Cancelled',
}

/**
 * B-5: Ownership-checked order fetch.
 *
 * Rules:
 * - Logged-in user → order must belong to that user_id
 * - Guest (no session) → order is viewable if it has no user_id
 *   (i.e. it's a genuine guest order, not a user order being snooped)
 *
 * UUID v4 (122-bit entropy) acts as the bearer token for guest orders.
 */
async function getOrder(id: string, userId: string | null): Promise<Order | null> {
  const supabase = adminDb()

  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)

  if (userId) {
    // Authenticated user: must own the order
    query = query.eq('user_id', userId)
  } else {
    // Guest: only show guest orders (user_id IS NULL)
    query = query.is('user_id', null)
  }

  const { data } = await query.maybeSingle()
  return data as Order | null
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getSession()
  const userId = session?.user?.id ?? null

  const order = await getOrder(params.id, userId).catch(() => null)
  const address = order?.metadata?.address

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-12">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-brand-sage/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7A8C6E"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-display-sm text-brand-brown-deep italic">
            Order placed!
          </h1>
          {order ? (
            <p className="mt-2 text-sm text-brand-text-secondary">
              Order{' '}
              <span className="font-medium text-brand-text-primary">
                {order.order_number}
              </span>{' '}
              has been confirmed. We&apos;ll send you a WhatsApp update when it&apos;s ready.
            </p>
          ) : (
            <p className="mt-2 text-sm text-brand-text-secondary">
              Your order is being processed. Check your email for confirmation.
            </p>
          )}
        </div>

        {order && (
          <>
            {/* Items */}
            <div
              className="card divide-y mb-6"
              style={{ borderColor: 'rgba(44,26,14,0.06)' }}
            >
              {order.order_items.map((item, i) => (
                <div key={i} className="p-4 flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-brand-text-primary">{item.product_name}</p>
                    {item.variant_label && (
                      <p className="text-xs text-brand-text-secondary">{item.variant_label}</p>
                    )}
                    {item.gift_wrap && (
                      <span className="text-xs text-brand-gold">🎁 Gift wrapped</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-brand-text-secondary">×{item.quantity}</p>
                    <p className="font-semibold text-brand-brown-deep">
                      ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals + address */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <div className="card p-4 space-y-2 text-sm">
                <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide">
                  Order total
                </p>
                <div className="flex justify-between">
                  <span className="text-brand-text-secondary">Subtotal</span>
                  <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-text-secondary">Delivery</span>
                  <span>
                    {Number(order.delivery_charge) === 0
                      ? 'Free'
                      : `₹${Number(order.delivery_charge)}`}
                  </span>
                </div>
                <div
                  className="flex justify-between font-semibold text-brand-brown-deep pt-1 border-t"
                  style={{ borderColor: 'rgba(44,26,14,0.08)' }}
                >
                  <span>Paid</span>
                  <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {address && (
                <div className="card p-4 text-sm">
                  <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide mb-2">
                    Delivering to
                  </p>
                  <p className="font-medium text-brand-text-primary">{address.fullName}</p>
                  <p className="text-brand-text-secondary">
                    {address.line1}, {address.city} {address.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-brand-sage/20 text-brand-sage">
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>
          </>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/account/orders" className="btn-secondary justify-center">
            View all orders
          </Link>
          <Link href="/shop" className="btn-primary justify-center">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
