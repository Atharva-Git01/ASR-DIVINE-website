'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = ['pending', 'confirmed', 'in_preparation', 'ready', 'out_for_delivery', 'delivered', 'cancelled']

type Props = { orderId: string; currentStatus: string }

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (status === currentStatus) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSaving(false)
    if (!res.ok) { setError('Failed to update status'); return }
    router.refresh()
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="text-sm rounded-xl px-3 py-2 border bg-transparent cursor-pointer text-brand-cream"
        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(200,151,58,0.20)' }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} style={{ background: '#1a0f07' }}>
            {s.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving || status === currentStatus}
        className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
        style={{ background: 'rgba(200,151,58,0.15)', color: '#C8973A', border: '1px solid rgba(200,151,58,0.25)' }}
      >
        {saving ? 'Saving…' : 'Update'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
