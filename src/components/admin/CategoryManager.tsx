'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = { id: string; name: string; slug: string; description: string | null; is_active: boolean }

type Props = { initialCategories: Category[] }

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY = { name: '', slug: '', description: '', is_active: true }

export function CategoryManager({ initialCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass = 'w-full rounded-xl px-3 py-2 text-sm text-brand-cream placeholder-brand-gold/30 border outline-none focus:border-brand-gold transition-colors'
  const inputStyle = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(200,151,58,0.20)' }

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? '', is_active: cat.is_active })
    setError(null)
  }

  function cancelEdit() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
  }

  async function handleSave() {
    if (!form.name || !form.slug) { setError('Name and slug are required'); return }
    setSaving(true)
    setError(null)

    const isNew = editing === 'new'
    const url = isNew ? '/api/admin/categories' : `/api/admin/categories/${editing}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setSaving(false)
    if (!res.ok) {
      const { error: err } = await res.json()
      setError(err ?? 'Save failed')
      return
    }

    router.refresh()
    cancelEdit()

    if (isNew) {
      const { id } = await res.json().catch(() => ({}))
      setCategories((prev) => [...prev, { id: id ?? Date.now().toString(), ...form }])
    } else {
      setCategories((prev) => prev.map((c) => c.id === editing ? { ...c, ...form } : c))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in it will become uncategorised.')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('Delete failed'); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const isEditing = (id: string) => editing === id

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(200,151,58,0.08)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ background: 'rgba(200,151,58,0.05)', borderColor: 'rgba(200,151,58,0.10)' }}>
              {['Name', 'Slug', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs text-brand-gold/50 font-medium tracking-wide uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'rgba(200,151,58,0.06)' }}>
            {categories.length === 0 && !isEditing('new') && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-brand-gold/40">No categories yet.</td></tr>
            )}
            {categories.map((cat) => (
              isEditing(cat.id) ? (
                <tr key={cat.id} style={{ background: 'rgba(200,151,58,0.04)' }}>
                  <td className="px-4 py-3">
                    <input value={form.name} className={inputClass} style={inputStyle} placeholder="Name"
                      onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) })) }} />
                  </td>
                  <td className="px-4 py-3">
                    <input value={form.slug} className={inputClass} style={inputStyle} placeholder="slug"
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                  </td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                        className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${form.is_active ? 'bg-brand-gold' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-xs text-brand-cream/60">{form.is_active ? 'Active' : 'Hidden'}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={handleSave} disabled={saving}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-choc disabled:opacity-50"
                        style={{ background: 'var(--color-gold)' }}>
                        {saving ? '…' : 'Save'}
                      </button>
                      <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs text-brand-gold/50 hover:text-brand-gold border transition-colors"
                        style={{ borderColor: 'rgba(200,151,58,0.20)' }}>
                        Cancel
                      </button>
                    </div>
                    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                  </td>
                </tr>
              ) : (
                <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-brand-cream font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-xs text-brand-gold/40">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-900/30 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                      {cat.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(cat)} className="text-xs text-brand-gold/50 hover:text-brand-gold transition-colors">Edit</button>
                      <button onClick={() => handleDelete(cat.id)} className="text-xs text-red-400/50 hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            ))}

            {/* Inline new row */}
            {isEditing('new') && (
              <tr style={{ background: 'rgba(200,151,58,0.04)' }}>
                <td className="px-4 py-3">
                  <input value={form.name} className={inputClass} style={inputStyle} placeholder="Category name" autoFocus
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} />
                </td>
                <td className="px-4 py-3">
                  <input value={form.slug} className={inputClass} style={inputStyle} placeholder="slug"
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${form.is_active ? 'bg-brand-gold' : 'bg-white/10'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs text-brand-cream/60">{form.is_active ? 'Active' : 'Hidden'}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-choc disabled:opacity-50"
                      style={{ background: 'var(--color-gold)' }}>
                      {saving ? '…' : 'Create'}
                    </button>
                    <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs text-brand-gold/50 hover:text-brand-gold border transition-colors"
                      style={{ borderColor: 'rgba(200,151,58,0.20)' }}>
                      Cancel
                    </button>
                  </div>
                  {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!editing && (
        <button onClick={() => { setEditing('new'); setForm(EMPTY) }}
          className="px-4 py-2 rounded-xl text-sm font-medium text-brand-choc"
          style={{ background: 'var(--color-gold)' }}>
          + New category
        </button>
      )}
    </div>
  )
}
