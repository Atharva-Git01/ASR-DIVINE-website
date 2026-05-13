'use client'

import { useState } from 'react'

type Request = {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  metadata: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

type Props = { requests: Request[] }

export function CustomRequestsClient({ requests: initial }: Props) {
  const [requests, setRequests] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(null)

  async function markRead(id: string) {
    await fetch(`/api/admin/messages/${id}/read`, { method: 'POST' }).catch(() => null)
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, is_read: true } : r))
  }

  if (requests.length === 0) {
    return <p className="text-sm text-brand-gold/40">No custom order requests yet.</p>
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => {
        const meta = r.metadata as Record<string, string> | null
        const isOpen = expanded === r.id
        return (
          <div key={r.id} className="rounded-2xl border overflow-hidden"
            style={{ background: r.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(200,151,58,0.04)', borderColor: r.is_read ? 'rgba(200,151,58,0.08)' : 'rgba(200,151,58,0.16)' }}>
            {/* Header row */}
            <button
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
              onClick={() => { setExpanded(isOpen ? null : r.id); if (!r.is_read) markRead(r.id) }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {!r.is_read && <span className="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-cream truncate">{r.name}</p>
                  <div className="flex gap-3 text-xs text-brand-gold/40 flex-wrap">
                    <span>{r.email}</span>
                    {r.phone && <span>{r.phone}</span>}
                    <span>{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              {meta && (
                <div className="hidden sm:flex gap-2 flex-shrink-0">
                  {meta.type && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-brand-gold/60 capitalize">{meta.type}</span>}
                  {meta.budget && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold">{meta.budget}</span>}
                </div>
              )}
              <span className="text-brand-gold/40 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: 'rgba(200,151,58,0.08)' }}>
                <div className="grid sm:grid-cols-2 gap-3 pt-4 text-xs">
                  {meta && Object.entries(meta).map(([k, v]) => v ? (
                    <div key={k} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(200,151,58,0.08)' }}>
                      <p className="text-brand-gold/40 mb-1 capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="text-brand-cream">{String(v)}</p>
                    </div>
                  ) : null)}
                </div>
                {r.message && (
                  <div>
                    <p className="text-xs text-brand-gold/40 mb-1">Notes</p>
                    <p className="text-sm text-brand-cream/70 whitespace-pre-wrap">{r.message}</p>
                  </div>
                )}
                <a href={`mailto:${r.email}?subject=Re: Custom Order Request`}
                  className="inline-block text-xs px-4 py-2 rounded-xl font-medium text-brand-choc"
                  style={{ background: 'var(--color-gold)' }}>
                  Reply by email
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
