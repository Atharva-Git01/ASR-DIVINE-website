'use client'

import { useCartStore } from '@/stores/cart'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const subtotal = useCartStore((s) => s.subtotal)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[49] bg-brand-brown-deep/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed right-0 top-0 z-cart-drawer flex h-full w-full max-w-sm flex-col bg-brand-white shadow-float"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-brown-deep/8 px-6 py-5">
          <h2 className="font-display text-lg italic text-brand-brown-deep tracking-[0.04em]">
            Your Cart
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="btn-icon">
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <BagIcon />
              <div>
                <p className="font-body text-sm font-medium text-brand-text-primary">
                  Your cart is empty
                </p>
                <p className="mt-1 text-xs text-brand-text-secondary">
                  Add some delicious items to get started.
                </p>
              </div>
              <button onClick={closeCart} className="btn btn-secondary text-xs">
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4 list-none">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {/* Image placeholder / actual image */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-brand-blush/40">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-brand-text-primary leading-snug">
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <p className="text-xs text-brand-text-secondary">{item.variantLabel}</p>
                        )}
                        {item.giftWrapped && (
                          <span className="badge badge-gold mt-1">Gift wrapped</span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-brand-text-secondary hover:text-brand-brown-deep transition-colors p-0.5"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Qty stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-brown-deep/20 text-xs text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep transition-colors"
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm font-medium text-brand-text-primary">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="flex h-6 w-6 items-center justify-center rounded-full border border-brand-brown-deep/20 text-xs text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-medium text-brand-brown-deep">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-brand-brown-deep/8 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-text-secondary">Subtotal</span>
              <span className="font-medium text-brand-text-primary">
                ₹{subtotal().toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary">
              Shipping & taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="btn btn-primary w-full justify-center"
            >
              Checkout
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
            >
              Continue shopping
            </button>
          </div>
        )}
      </aside>
    </>
  )
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-brand-blush"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
