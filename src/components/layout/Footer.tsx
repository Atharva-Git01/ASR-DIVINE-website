import Link from 'next/link'
import Image from 'next/image'

const SHOP_LINKS = [
  { href: '/shop/chocolates', label: 'Chocolates' },
  { href: '/shop/cakes', label: 'Celebration Cakes' },
  { href: '/shop/cookies', label: 'Cookies & Bars' },
  { href: '/shop/gifting', label: 'Gift Hampers' },
  { href: '/custom', label: 'Custom Orders' },
]

const INFO_LINKS = [
  { href: '/about', label: 'Our Story' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/faq', label: 'FAQ' },
  { href: '/delivery', label: 'Delivery & Pickup' },
]

const LEGAL_LINKS = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Service' },
  { href: '/legal/refunds', label: 'Refund Policy' },
]

const DEFAULT_HOURS = [
  { days: 'Mon – Fri', hours: '10am – 7pm' },
  { days: 'Sat – Sun', hours: '10am – 8pm' },
]

type FooterProps = {
  logoSrc?: string | null
}

export function Footer({ logoSrc }: FooterProps) {
  const address = process.env.NEXT_PUBLIC_BAKERY_ADDRESS ?? 'Pune, Maharashtra, India'
  const email = process.env.NEXT_PUBLIC_BAKERY_EMAIL ?? 'asrdivine2026@gmail.com'
  const phone = process.env.NEXT_PUBLIC_BAKERY_PHONE ?? ''
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? ''
  const facebook = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? ''
  const twitter = process.env.NEXT_PUBLIC_TWITTER_URL ?? ''
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_BAKERY_PHONE ?? ''

  return (
    <footer className="bg-brand-brown-deep text-brand-cream/80">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" aria-label="ASR Divine — Home" className="inline-block">
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt="ASR Divine"
                  width={280}
                  height={180}
                  className="w-[280px] h-auto rounded-lg"
                />
              ) : (
                <span className="font-display text-xl italic text-brand-cream tracking-[0.06em]">
                  ASR Divine
                </span>
              )}
            </Link>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-3">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <InstagramIcon />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <FacebookIcon />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <TwitterIcon />
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-brand-cream/20 text-brand-cream/60 transition-colors hover:border-brand-gold hover:text-brand-gold"
                >
                  <WhatsappIcon />
                </a>
              )}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-brand-gold">
              Shop
            </h3>
            <ul className="space-y-2.5 list-none">
              {SHOP_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-brand-cream/60 transition-colors hover:text-brand-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-brand-gold">
              Information
            </h3>
            <ul className="space-y-2.5 list-none">
              {INFO_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-brand-cream/60 transition-colors hover:text-brand-cream"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Hours */}
          <div>
            <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.12em] text-brand-gold">
              Visit Us
            </h3>

            <address className="not-italic text-sm text-brand-cream/60 leading-relaxed mb-4">
              {address}
            </address>

            {phone && (
              <a
                href={`tel:${phone}`}
                className="block text-sm text-brand-cream/60 hover:text-brand-cream transition-colors mb-1.5"
              >
                {phone}
              </a>
            )}

            <a
              href={`mailto:${email}`}
              className="block text-sm text-brand-cream/60 hover:text-brand-cream transition-colors mb-4"
            >
              {email}
            </a>

            {/* Opening hours */}
            <div className="space-y-1">
              {DEFAULT_HOURS.map(({ days, hours }) => (
                <div key={days} className="flex justify-between gap-4 text-xs text-brand-cream/50">
                  <span>{days}</span>
                  <span className="text-brand-cream/70">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-brand-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-brand-cream/40 sm:flex-row lg:px-12">
          <p>© {new Date().getFullYear()} ASR Divine. All rights reserved.</p>
          <nav aria-label="Legal links">
            <ul className="flex items-center gap-4 list-none">
              {LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-brand-cream/70 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function InstagramIcon() {
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
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon() {
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
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterIcon() {
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
      <path d="M4 4l16 16M4 20L20 4" />
    </svg>
  )
}

function WhatsappIcon() {
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
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
