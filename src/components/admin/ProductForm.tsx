'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type Category = { id: string; name: string }

type ProductImage = {
  id: string
  url: string
  altText: string
  sortOrder: number
}

type ProductData = {
  id?: string
  name: string
  slug: string
  description: string
  base_price: number
  category_id: string
  is_active: boolean
  is_eggless: boolean
  is_seasonal: boolean
  is_bestseller: boolean
  stock_count: string
  tags: string
  serving_size: string
  shelf_life: string
}

type Props = {
  categories: Category[]
  initial?: Partial<ProductData>
  /** Existing images (for edit mode) */
  initialImages?: ProductImage[]
  isNew: boolean
}

const EMPTY: ProductData = {
  name: '',
  slug: '',
  description: '',
  base_price: 0,
  category_id: '',
  is_active: true,
  is_eggless: false,
  is_seasonal: false,
  is_bestseller: false,
  stock_count: '',
  tags: '',
  serving_size: '',
  shelf_life: '',
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProductForm({ categories, initial, initialImages = [], isNew }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProductData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Image state (B-4)
  const [images, setImages] = useState<ProductImage[]>(initialImages)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Delete confirmation (L-1)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function set<K extends keyof ProductData>(field: K, value: ProductData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      base_price: Number(form.base_price),
      stock_count: form.stock_count === '' ? null : Number(form.stock_count),
      tags: form.tags
        ? form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }

    const url = isNew ? '/api/admin/products' : `/api/admin/products/${form.id}`
    const method = isNew ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setSaving(false)
    if (!res.ok) {
      const { error: err } = await res.json()
      setError(err ?? 'Save failed')
      return
    }

    if (isNew) {
      // B-4: redirect to edit page so images can be added
      const { id } = await res.json()
      router.push(`/admin/products/${id}`)
    } else {
      router.push('/admin/products')
    }
    router.refresh()
  }

  async function handleDeleteConfirmed() {
    if (!form.id) return
    setConfirmDelete(false)
    await fetch(`/api/admin/products/${form.id}`, { method: 'DELETE' })
    router.push('/admin/products')
    router.refresh()
  }

  // ── Image upload (B-4) ────────────────────────────────────────────────────────

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form.id) return

    setUploadingImage(true)
    setImageError(null)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('altText', form.name)

    const res = await fetch(`/api/admin/products/${form.id}/images`, {
      method: 'POST',
      body: fd,
    })

    setUploadingImage(false)
    if (fileInputRef.current) fileInputRef.current.value = ''

    if (!res.ok) {
      const { error: err } = await res.json()
      setImageError(err ?? 'Upload failed')
      return
    }

    const { id, url, sortOrder } = await res.json()
    setImages((prev) => [...prev, { id, url, altText: form.name, sortOrder }])
  }

  async function handleDeleteImage(imageId: string) {
    if (!form.id) return
    const res = await fetch(`/api/admin/products/${form.id}/images?imageId=${imageId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
    }
  }

  const inputClass =
    'w-full rounded-xl px-3 py-2.5 text-sm text-brand-cream placeholder-brand-gold/30 border outline-none focus:border-brand-gold transition-colors'
  const inputStyle = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(200,151,58,0.20)' }
  const labelClass = 'block text-xs text-brand-gold/50 mb-1.5'

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="rounded-xl px-4 py-3 text-sm bg-red-900/20 text-red-400 border border-red-900/30">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Product name *</label>
            <input
              type="text"
              value={form.name}
              required
              className={inputClass}
              style={inputStyle}
              placeholder="Dark Chocolate Truffle Box"
              onChange={(e) => {
                set('name', e.target.value)
                if (isNew) set('slug', toSlug(e.target.value))
              }}
            />
          </div>
          <div>
            <label className={labelClass}>Slug *</label>
            <input
              type="text"
              value={form.slug}
              required
              className={inputClass}
              style={inputStyle}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="dark-chocolate-truffle-box"
            />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1a0f07' }}>
                — Select —
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ background: '#1a0f07' }}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Base price (₹) *</label>
            <input
              type="number"
              value={form.base_price}
              min={0}
              required
              className={inputClass}
              style={inputStyle}
              onChange={(e) => set('base_price', Number(e.target.value))}
              placeholder="599"
            />
          </div>
          <div>
            <label className={labelClass}>Stock count (blank = unlimited)</label>
            <input
              type="number"
              value={form.stock_count}
              min={0}
              className={inputClass}
              style={inputStyle}
              onChange={(e) => set('stock_count', e.target.value)}
              placeholder="∞"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Short description</label>
          <textarea
            value={form.description}
            rows={3}
            className={inputClass + ' resize-none'}
            style={inputStyle}
            onChange={(e) => set('description', e.target.value)}
            placeholder="A decadent box of single-origin dark chocolate truffles…"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Serving size</label>
            <input
              type="text"
              value={form.serving_size}
              className={inputClass}
              style={inputStyle}
              onChange={(e) => set('serving_size', e.target.value)}
              placeholder="Box of 12 pieces"
            />
          </div>
          <div>
            <label className={labelClass}>Shelf life</label>
            <input
              type="text"
              value={form.shelf_life}
              className={inputClass}
              style={inputStyle}
              onChange={(e) => set('shelf_life', e.target.value)}
              placeholder="7 days refrigerated"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Tags (comma-separated)</label>
          <input
            type="text"
            value={form.tags}
            className={inputClass}
            style={inputStyle}
            onChange={(e) => set('tags', e.target.value)}
            placeholder="bestseller, gifting, dark chocolate"
          />
        </div>

        {/* Toggles */}
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['is_active', 'Active (visible on site)'],
              ['is_eggless', 'Eggless'],
              ['is_seasonal', 'Seasonal'],
              ['is_bestseller', 'Mark as bestseller'],
            ] as [keyof ProductData, string][]
          ).map(([field, label]) => (
            <label key={field} className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => set(field, !form[field] as ProductData[typeof field])}
                className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${form[field] ? 'bg-brand-gold' : 'bg-white/10'}`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form[field] ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </div>
              <span className="text-sm text-brand-cream/70">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-brand-choc transition-all disabled:opacity-50"
            style={{ background: 'var(--color-gold)' }}
          >
            {saving ? 'Saving…' : isNew ? 'Create product' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-brand-gold/60 hover:text-brand-gold transition-colors border"
            style={{ borderColor: 'rgba(200,151,58,0.20)' }}
          >
            Cancel
          </button>
          {!isNew && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="ml-auto px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors border border-red-900/20"
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {/* ── B-4: Image management (edit mode only) ──────────────────────────── */}
      {!isNew && form.id && (
        <div className="mt-10 max-w-2xl">
          <h3 className="text-sm font-medium text-brand-gold/50 mb-4 uppercase tracking-wide">
            Product images
          </h3>

          {/* Existing images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4 sm:grid-cols-4">
              {images
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((img) => (
                  <div
                    key={img.id}
                    className="relative group aspect-square rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || 'Product image'}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <button
                      onClick={() => handleDeleteImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Upload new image */}
          <label
            className="flex items-center gap-3 cursor-pointer rounded-xl border px-4 py-3 text-sm transition-colors hover:border-brand-gold/40"
            style={{ borderColor: 'rgba(200,151,58,0.20)', borderStyle: 'dashed' }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            {uploadingImage ? (
              <span className="text-brand-gold/50 text-xs">Uploading…</span>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-brand-gold/40"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-brand-gold/50 text-xs">
                  Click to upload image (JPEG, PNG, WebP — max 5 MB)
                </span>
              </>
            )}
          </label>

          {imageError && <p className="mt-2 text-xs text-red-400">{imageError}</p>}
        </div>
      )}

      {/* ── L-1: Confirm delete dialog ──────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this product?"
        description="This will permanently remove the product and all its images. This cannot be undone."
        confirmLabel="Delete product"
        cancelLabel="Keep it"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
