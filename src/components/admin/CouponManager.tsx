'use client'

import { useState } from 'react'

type Coupon = {
  id: string
  code: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order_value: number | null
  max_uses: number | null
  used_count: number
  is_active: boolean
  expires_at: string | null
}

type Props = { initialCoupons: Coupon[] }

type FormState = {
  code: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order_value: string
  max_uses: string
  expires_at: string
  is_active: boolean
}

const EMPTY: FormState = {
  code: '',
  discount_type: 'percentage',
  discount_value: 10,
  min_order_value: '',
  max_uses: '',
  expires_at: '',
  is_active: true,
}

export function CouponManager({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full rounded-xl px-3 py-2 text-sm text-brand-cream placeholder-brand-gold/30 border outline-none focus:border-brand-gold transition-colors'
  const inputStyle = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(200,151,58,0.20)' }
  const labelClass = 'block text-xs text-brand-gold/50 mb-1'

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code) {
      setError('Code is required')
      return
    }
    setSaving(true)
    setError(null)

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        min_order_value: form.min_order_value === '' ? null : Number(form.min_order_value),
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        expires_at: form.expires_at || null,
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const { error: err } = await res.json()
      setError(err ?? 'Save failed')
      return
    }
    const { id } = await res.json()
    setCoupons((prev) => [
      {
        id,
        code: form.code,
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_value: form.min_order_value === '' ? null : Number(form.min_order_value),
        max_uses: form.max_uses === '' ? null : Number(form.max_uses),
        used_count: 0,
        is_active: form.is_active,
        expires_at: form.expires_at || null,
      },
      ...prev,
    ])
    setShowForm(false)
    setForm(EMPTY)
  }

  async function toggleActive(coupon: Coupon) {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    })
    if (!res.ok) return
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
    )
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setCoupons((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      {showForm && (
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(200,151,58,0.12)' }}
        >
          <p className="text-sm font-medium text-brand-cream mb-4">New Coupon</p>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Code *</label>
              <input
                value={form.code}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="WELCOME20"
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={form.discount_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discount_type: e.target.value as 'percentage' | 'flat' }))
                }
                className={inputClass}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="percentage" style={{ background: '#1a0f07' }}>
                  Percentage (%)
                </option>
                <option value="flat" style={{ background: '#1a0f07' }}>
                  Flat (₹)
                </option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value *</label>
              <input
                type="number"
                value={form.discount_value}
                min={1}
                required
                className={inputClass}
                style={inputStyle}
                onChange={(e) => setForm((f) => ({ ...f, discount_value: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className={labelClass}>Min order (₹)</label>
              <input
                type="number"
                value={form.min_order_value}
                min={0}
                className={inputClass}
                style={inputStyle}
                placeholder="None"
                onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Max uses</label>
              <input
                type="number"
                value={form.max_uses}
                min={1}
                className={inputClass}
                style={inputStyle}
                placeholder="Unlimited"
                onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelClass}>Expires at</label>
              <input
                type="date"
                value={form.expires_at}
                className={inputClass}
                style={inputStyle}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              />
            </div>
            {error && <p className="sm:col-span-3 text-xs text-red-400">{error}</p>}
            <div className="sm:col-span-3 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-medium text-brand-choc disabled:opacity-50"
                style={{ background: 'var(--color-gold)' }}
              >
                {saving ? 'Creating…' : 'Create coupon'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setError(null)
                }}
                className="px-5 py-2 rounded-xl text-sm text-brand-gold/50 hover:text-brand-gold border transition-colors"
                style={{ borderColor: 'rgba(200,151,58,0.20)' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-2xl border overflow-x-auto"
        style={{ borderColor: 'rgba(200,151,58,0.08)' }}
      >
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr
              className="border-b"
              style={{ background: 'rgba(200,151,58,0.05)', borderColor: 'rgba(200,151,58,0.10)' }}
            >
              {['Code', 'Discount', 'Min order', 'Uses', 'Expires', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs text-brand-gold/50 font-medium tracking-wide uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-brand-gold/40">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono font-medium text-brand-cream">{c.code}</td>
                <td className="px-4 py-3 text-brand-gold">
                  {c.discount_type === 'percentage'
                    ? `${c.discount_value}%`
                    : `₹${c.discount_value}`}
                </td>
                <td className="px-4 py-3 text-xs text-brand-gold/60">
                  {c.min_order_value ? `₹${c.min_order_value}` : '—'}
                </td>
                <td className="px-4 py-3 text-xs text-brand-gold/60">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ''}
                </td>
                <td className="px-4 py-3 text-xs text-brand-gold/60">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`text-xs px-2 py-0.5 rounded-full transition-colors ${c.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}
                  >
                    {c.is_active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400/40 hover:text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-brand-choc"
          style={{ background: 'var(--color-gold)' }}
        >
          + New coupon
        </button>
      )}
    </div>
  )
}
