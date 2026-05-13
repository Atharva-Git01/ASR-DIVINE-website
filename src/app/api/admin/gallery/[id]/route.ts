import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const body = await request.json()
  const allowed = ['alt', 'is_active', 'sort_order']
  const update = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const { error } = await adminDb().from('gallery_images').update(update).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const db = adminDb()

  const { data } = await db.from('gallery_images').select('url').eq('id', params.id).single()
  if (data?.url) {
    const filename = data.url.split('/').pop()
    if (filename) await db.storage.from('gallery').remove([filename]).catch(() => null)
  }

  const { error } = await db.from('gallery_images').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
