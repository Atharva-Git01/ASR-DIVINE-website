import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { name, slug, description, is_active } = await request.json()
  if (!name || !slug)
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })

  const { error } = await adminDb()
    .from('categories')
    .update({
      name,
      slug,
      description: description || null,
      is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { error } = await adminDb().from('categories').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
