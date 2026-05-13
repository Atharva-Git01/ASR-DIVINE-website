'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user.name ?? '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // tRPC profile.update will go here once Supabase is connected
    await new Promise((r) => setTimeout(r, 600))
    await update({ name })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="font-body font-semibold text-brand-brown-deep mb-1">Profile</h2>
        <p className="text-sm text-brand-text-secondary">Update your name and contact details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-xs text-brand-text-secondary mb-1.5">Full name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Priya Sharma"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs text-brand-text-secondary mb-1.5">Email</label>
          <input
            id="email"
            type="email"
            value={session?.user.email ?? ''}
            disabled
            className="input opacity-60 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-brand-text-secondary">Email cannot be changed here.</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs text-brand-text-secondary mb-1.5">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="+91 98765 43210"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
