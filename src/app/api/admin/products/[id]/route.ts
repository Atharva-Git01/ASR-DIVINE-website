import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const body = await request.json()
  const {
    name,
    slug,
    description,
    base_price,
    category_id,
    is_active,
    is_eggless,
    is_seasonal,
    is_bestseller,
    stock_count,
    tags,
    serving_size,
    shelf_life,
  } = body

  if (!name || !slug || base_price == null) {
    return NextResponse.json({ error: 'name, slug and base_price are required' }, { status: 400 })
  }

  const { error } = await adminDb()
    .from('products')
    .update({
      name,
      slug,
      description: description || null,
      base_price,
      category_id: category_id || null,
      is_active,
      is_eggless,
      is_seasonal,
      is_bestseller,
      stock_count: stock_count ?? null,
      tags: tags ?? [],
      serving_size: serving_size || null,
      shelf_life: shelf_life || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { error } = await adminDb().from('products').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
