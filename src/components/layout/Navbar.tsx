'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useCartStore } from '@/stores/cart'

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop?category=chocolates', label: 'Chocolates' },
  { href: '/custom-order', label: 'Custom Orders' },
  { href: '/about', label: 'Our Story' },
  { href: '/gallery', label: 'Gallery' },
]

type NavbarProps = {
  logoSrc?: string | null
}

export function Navbar({ logoSrc }: NavbarProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const itemCount = useCartStore((s) => s.itemCount())
  const openCart = useCartStore((s) => s.openCart)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/shop?q=${encodeURIComponent(q)}`)
      setQuery('')
      setSearchOpen(false)
    }
  }

  const isSolid = scrolled || !isHome
  const textColor = isSolid ? 'text-brand-cream/80 hover:text-white' : 'text-white hover:text-white/80'
  const iconClass = `btn-icon ${isSolid ? 'text-brand-cream/80 hover:text-white hover:bg-white/10' : 'text-white hover:text-white/80 hover:bg-white/10'}`

  return (
    <header
      className={`fixed top-0 z-navbar w-full transition-all duration-300 ${
        isSolid
          ? 'bg-brand-brown-deep backdrop-blur-md shadow-card-sm border-b border-brand-gold/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="ASR Divine — Home">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt="ASR Divine"
              width={120}
              height={44}
              className="h-11 w-auto rounded-md"
              priority
            />
          ) : (
            <span className={`font-display text-xl italic tracking-[0.06em] ${isSolid ? 'text-brand-cream' : 'text-white'}`}>
              ASR Divine
            </span>
          )}
        </Link>

        {/* Search bar — fills the blank space */}
        <form
          onSubmit={handleSearch}
          className="flex-1 mx-4 outline-none"
        >
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 outline-none transition-all duration-300 ${
            isSolid
              ? 'bg-white/10 border border-white/10 focus-within:bg-white/15'
              : 'bg-white/10 border border-white/15 focus-within:bg-white/15'
          }`}>
            <SearchIcon className={isSolid ? 'text-brand-cream/60' : 'text-white/60'} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chocolates, cakes..."
              className="flex-1 bg-transparent text-sm outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 placeholder:text-white/40 text-white min-w-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-white/40 hover:text-white/80 flex-shrink-0"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex gap-6 items-center list-none flex-shrink-0">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className={`text-sm tracking-[0.03em] transition-colors duration-200 ${textColor}`}>
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={`${iconClass} hidden sm:flex items-center justify-center`}
          >
            <HeartIcon />
          </Link>

          {/* Cart */}
          <button
            aria-label={`Cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
            onClick={openCart}
            className={`relative flex items-center gap-2 rounded-pill px-4 py-2 text-xs font-body tracking-[0.04em] transition-colors ${
              isSolid
                ? 'bg-brand-gold/20 text-brand-cream border border-brand-gold/40 hover:bg-brand-gold/30'
                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm'
            }`}
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
            className={`${iconClass} lg:hidden`}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`border-t lg:hidden ${
          isSolid
            ? 'border-brand-gold/10 bg-brand-brown-deep'
            : 'border-white/15 bg-black/60 backdrop-blur-md'
        }`}>
          <ul className="flex flex-col px-6 py-4 gap-1 list-none">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm transition-colors ${
                    isSolid
                      ? 'text-brand-cream/80 hover:text-white'
                      : 'text-white/85 hover:text-white'
                  }`}
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

// ── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
