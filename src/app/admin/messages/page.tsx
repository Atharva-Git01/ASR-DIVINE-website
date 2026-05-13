import { adminDb } from '@/lib/supabase/admin'

async function getMessages() {
  const { data } = await adminDb()
    .from('contact_messages')
    .select('id, name, email, phone, subject, message, is_read, created_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-brand-gold/15 text-brand-gold',
  read: 'bg-white/5 text-brand-gold/40',
}

export default async function AdminMessagesPage() {
  const messages = await getMessages().catch(() => [])
  const unread = messages.filter((m) => !m.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-brand-cream">Messages</h1>
        {unread > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold">{unread} new</span>
        )}
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-brand-gold/40">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border p-5" style={{ background: m.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(200,151,58,0.04)', borderColor: m.is_read ? 'rgba(200,151,58,0.08)' : 'rgba(200,151,58,0.16)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-brand-cream">{m.name}</p>
                    {!m.is_read && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold">New</span>}
                    {m.subject && <p className="text-xs text-brand-gold/60">— {m.subject}</p>}
                  </div>
                  <div className="flex gap-3 text-xs text-brand-gold/40 flex-wrap">
                    <a href={`mailto:${m.email}`} className="hover:text-brand-gold transition-colors">{m.email}</a>
                    {m.phone && <span>{m.phone}</span>}
                    <span>{new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <MessageActions id={m.id} isRead={m.is_read} />
              </div>
              <p className="mt-3 text-sm text-brand-cream/70 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageActions({ id, isRead }: { id: string; isRead: boolean }) {
  return (
    <form action={`/api/admin/messages/${id}/read`} method="POST" className="flex-shrink-0">
      {!isRead && (
        <button type="submit" className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors whitespace-nowrap">
          Mark read
        </button>
      )}
    </form>
  )
}
