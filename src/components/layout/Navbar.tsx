'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/stores/cart'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop/chocolates', label: 'Chocolates' },
  { href: '/custom', label: 'Custom Orders' },
  { href: '/about', label: 'Our Story' },
  { href: '/gallery', label: 'Gallery' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const openCart = useCartStore((s) => s.openCart)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-navbar w-full transition-shadow duration-200 ${
        scrolled ? 'shadow-card-sm' : ''
      } bg-brand-white border-b border-brand-brown-deep/8`}
    >
      <nav className="mx-auto flex max-w-7xl items-center px-6 py-5 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl italic text-brand-brown-deep tracking-[0.06em] mr-auto lg:mr-0"
        >
          ASR Divine
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex gap-7 mx-auto items-center list-none">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-brand-text-secondary tracking-[0.03em] hover:text-brand-brown-deep transition-colors duration-150"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {/* Search */}
          <button aria-label="Search" className="btn-icon hidden sm:flex">
            <SearchIcon />
          </button>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="btn-icon hidden sm:flex items-center justify-center"
          >
            <HeartIcon />
          </Link>

          {/* Cart */}
          <button
            aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-pill bg-brand-brown-deep px-4 py-2 text-xs font-body tracking-[0.04em] text-brand-cream transition-colors hover:bg-brand-brown-mid"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[9px] font-medium text-brand-choc">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-icon lg:hidden"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-brand-brown-deep/8 bg-brand-white lg:hidden">
          <ul className="flex flex-col px-6 py-4 gap-1 list-none">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

// ── Inline SVG icons (no external dep for 3 tiny icons) ─────────────────────

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function MenuIcon() {
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
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

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
