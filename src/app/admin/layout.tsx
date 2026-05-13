import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user.isAdmin) redirect('/')

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0705' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b"
          style={{ background: '#1a0f07', borderColor: 'rgba(200,151,58,0.15)' }}
        >
          <h1 className="text-xs font-medium tracking-widest uppercase text-brand-gold/60">
            Admin Panel
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-gold/50 hidden sm:block">
              {session.user.email}
            </span>
            <a
              href="/"
              target="_blank"
              className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors"
            >
              View site ↗
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
