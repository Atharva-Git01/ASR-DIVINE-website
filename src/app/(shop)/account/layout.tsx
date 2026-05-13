import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'

const NAV = [
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/orders', label: 'My Orders' },
  { href: '/account/addresses', label: 'Addresses' },
]

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/auth/signin?callbackUrl=/account/profile')

  return (
    <div className="bg-brand-cream min-h-screen">
      <div className="bg-brand-white border-b pt-14 pb-10" style={{ borderColor: 'rgba(44,26,14,0.08)' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <p className="eyebrow mb-2">Your Account</p>
          <h1 className="font-display text-display-sm text-brand-brown-deep italic">
            {session.user.name ?? session.user.email}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px,1fr] lg:gap-16 items-start">
          {/* Sidebar */}
          <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text-secondary hover:text-brand-brown-deep hover:bg-brand-blush/30 transition-colors"
              >
                {label}
              </Link>
            ))}
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors mt-2 lg:mt-4"
              >
                Sign out
              </button>
            </form>
          </nav>

          {/* Main content */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
