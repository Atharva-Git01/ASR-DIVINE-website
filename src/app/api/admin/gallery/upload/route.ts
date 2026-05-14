import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: 'File exceeds 5 MB' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const db = adminDb()
  const { error: storageError } = await db.storage
    .from('gallery')
    .upload(filename, bytes, { contentType: file.type, upsert: false })

  if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 })

  const {
    data: { publicUrl },
  } = db.storage.from('gallery').getPublicUrl(filename)

  const { data: row, error: dbError } = await db
    .from('gallery_images')
    .insert({ url: publicUrl, alt: null, sort_order: Date.now(), is_active: true })
    .select('id, url, alt, sort_order, is_active')
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(row, { status: 201 })
}
