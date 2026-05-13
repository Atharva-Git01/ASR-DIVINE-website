'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

type GalleryImage = { id: string; url: string; alt: string | null; sort_order: number; is_active: boolean }

type Props = { initialImages: GalleryImage[] }

export function GalleryAdmin({ initialImages }: Props) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [editingAlt, setEditingAlt] = useState<string | null>(null)
  const [altValue, setAltValue] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(files: FileList) {
    if (!files.length) return
    setUploading(true)
    setUploadError(null)

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/gallery/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}))
        setUploadError(error ?? 'Upload failed')
        setUploading(false)
        return
      }
      const img = await res.json()
      setImages((prev) => [...prev, img])
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this image from the gallery?')) return
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  async function toggleActive(image: GalleryImage) {
    const res = await fetch(`/api/admin/gallery/${image.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !image.is_active }),
    })
    if (!res.ok) return
    setImages((prev) => prev.map((img) => img.id === image.id ? { ...img, is_active: !img.is_active } : img))
  }

  async function saveAlt(id: string) {
    await fetch(`/api/admin/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alt: altValue }),
    })
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, alt: altValue } : img))
    setEditingAlt(null)
  }

  async function move(id: string, direction: 'up' | 'down') {
    const idx = images.findIndex((img) => img.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === images.length - 1) return

    const next = [...images]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const a = next[idx]!
    const b = next[swapIdx]!
    next[idx] = b
    next[swapIdx] = a

    const reordered = next.map((img, i) => ({ ...img, sort_order: i }))
    setImages(reordered)

    await fetch('/api/admin/gallery/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reordered.map(({ id: imgId, sort_order }) => ({ id: imgId, sort_order }))),
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className="rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-brand-gold/40 transition-colors"
        style={{ borderColor: 'rgba(200,151,58,0.20)' }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) handleUpload(e.dataTransfer.files) }}>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        <p className="text-sm text-brand-gold/60">
          {uploading ? 'Uploading…' : 'Click or drag images to upload'}
        </p>
        <p className="text-xs text-brand-gold/30 mt-1">JPEG, PNG, WebP — max 5 MB each</p>
        {uploadError && <p className="text-xs text-red-400 mt-2">{uploadError}</p>}
      </div>

      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={img.id} className={`rounded-2xl overflow-hidden border group relative aspect-square ${!img.is_active ? 'opacity-50' : ''}`}
              style={{ borderColor: 'rgba(200,151,58,0.12)' }}>
              <Image src={img.url} alt={img.alt ?? ''} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <button onClick={() => move(img.id, 'up')} disabled={idx === 0}
                    className="text-white/70 hover:text-white disabled:opacity-20 text-lg leading-none">‹</button>
                  <button onClick={() => handleDelete(img.id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                  <button onClick={() => move(img.id, 'down')} disabled={idx === images.length - 1}
                    className="text-white/70 hover:text-white disabled:opacity-20 text-lg leading-none rotate-0">›</button>
                </div>
                <div className="space-y-2">
                  {editingAlt === img.id ? (
                    <div className="flex gap-1">
                      <input value={altValue} onChange={(e) => setAltValue(e.target.value)} placeholder="Alt text"
                        className="flex-1 rounded px-2 py-1 text-xs text-white bg-black/60 border border-white/20 outline-none" />
                      <button onClick={() => saveAlt(img.id)} className="text-xs text-brand-gold px-2">✓</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingAlt(img.id); setAltValue(img.alt ?? '') }}
                      className="text-xs text-white/50 hover:text-white truncate w-full text-left">
                      {img.alt || 'Add alt text'}
                    </button>
                  )}
                  <button onClick={() => toggleActive(img)}
                    className={`text-xs w-full py-1 rounded ${img.is_active ? 'bg-green-900/50 text-green-300' : 'bg-white/10 text-white/50'}`}>
                    {img.is_active ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
