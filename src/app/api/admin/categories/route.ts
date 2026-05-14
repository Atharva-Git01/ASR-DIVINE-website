import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { name, slug, description, is_active } = await request.json()
  if (!name || !slug)
    return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })

  const { data, error } = await adminDb()
    .from('categories')
    .insert({ name, slug, description: description || null, is_active: is_active ?? true })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
