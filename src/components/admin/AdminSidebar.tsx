'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '⬡' },
  { href: '/admin/orders', label: 'Orders', icon: '📦' },
  { href: '/admin/products', label: 'Products', icon: '🍫' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷️' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🎟️' },
  { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
  { href: '/admin/messages', label: 'Messages', icon: '✉️' },
  { href: '/admin/custom-requests', label: 'Custom Requests', icon: '🎂' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-40 border-r"
      style={{ background: '#1a0f07', borderColor: 'rgba(200,151,58,0.12)' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(200,151,58,0.12)' }}>
        <Link href="/admin" className="block">
          <span className="font-display text-lg italic text-brand-gold">Cocoa & Crumb</span>
          <span className="block text-[10px] text-brand-gold/40 tracking-widest uppercase mt-0.5">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive
                  ? 'bg-brand-gold/15 text-brand-gold font-medium'
                  : 'text-brand-gold/50 hover:text-brand-gold/80 hover:bg-white/5'
              }`}
            >
              <span className="text-base w-5 text-center leading-none">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(200,151,58,0.12)' }}>
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-gold/40 hover:text-red-400 hover:bg-red-900/10 transition-all"
        >
          <span className="text-base w-5 text-center">↩</span>
          Sign out
        </Link>
      </div>
    </aside>
  )
}
