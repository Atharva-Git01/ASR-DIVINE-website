'use client'

import { useState } from 'react'

type Address = {
  id: string
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

// Demo until tRPC addresses.list is wired
const DEMO_ADDRESSES: Address[] = [
  {
    id: 'a1',
    label: 'Home',
    line1: 'Flat 4B, Sunrise Apartments',
    line2: 'Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    isDefault: true,
  },
]

const EMPTY_FORM = {
  label: 'Home',
  line1: '',
  line2: '',
  city: 'Pune',
  state: 'Maharashtra',
  pincode: '',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(DEMO_ADDRESSES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function handleChange(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 500))
    const newAddr: Address = { id: crypto.randomUUID(), ...form }
    if (form.isDefault) {
      setAddresses((prev) => [...prev.map((a) => ({ ...a, isDefault: false })), newAddr])
    } else {
      setAddresses((prev) => [...prev, newAddr])
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
    setSaving(false)
  }

  function handleDelete(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-body font-semibold text-brand-brown-deep mb-1">Addresses</h2>
          <p className="text-sm text-brand-text-secondary">Saved delivery addresses.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary text-xs">
            + Add address
          </button>
        )}
      </div>

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-brand-text-secondary py-4">No saved addresses yet.</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="card p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-text-primary">{addr.label}</span>
              {addr.isDefault && (
                <span className="badge-gold text-[10px] px-1.5 py-0.5">Default</span>
              )}
            </div>
            <p className="text-sm text-brand-text-secondary leading-relaxed">
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ''}
              <br />
              {addr.city}, {addr.state} – {addr.pincode}
            </p>
          </div>
          <button
            onClick={() => handleDelete(addr.id)}
            className="text-xs text-brand-text-secondary hover:text-red-500 transition-colors flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ))}

      {showForm && (
        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <h3 className="font-body font-semibold text-brand-brown-deep text-sm">New address</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-text-secondary mb-1.5">Label</label>
              <select
                value={form.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="input"
              >
                <option>Home</option>
                <option>Office</option>
                <option>Other</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-text-secondary mb-1.5">
                Address line 1 *
              </label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => handleChange('line1', e.target.value)}
                required
                className="input"
                placeholder="Flat / Building name, Street"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-brand-text-secondary mb-1.5">
                Address line 2
              </label>
              <input
                type="text"
                value={form.line2}
                onChange={(e) => handleChange('line2', e.target.value)}
                className="input"
                placeholder="Area / Landmark"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
                className="input"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">Pincode *</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                required
                pattern="\d{6}"
                className="input"
                placeholder="411001"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-brand-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => handleChange('isDefault', e.target.checked)}
              className="rounded"
            />
            Set as default address
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save address'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
