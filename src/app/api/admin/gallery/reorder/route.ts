import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const items: { id: string; sort_order: number }[] = await request.json()
  const db = adminDb()

  await Promise.all(
    items.map(({ id, sort_order }) =>
      db.from('gallery_images').update({ sort_order }).eq('id', id)
    )
  )

  return NextResponse.json({ success: true })
}
