import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { code, discount_type, discount_value, min_order_value, max_uses, expires_at, is_active } = await request.json()
  if (!code || !discount_type || discount_value == null) {
    return NextResponse.json({ error: 'code, discount_type and discount_value are required' }, { status: 400 })
  }

  const { data, error } = await adminDb()
    .from('coupons')
    .insert({ code: code.toUpperCase(), discount_type, discount_value, min_order_value, max_uses, expires_at, is_active: is_active ?? true })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
