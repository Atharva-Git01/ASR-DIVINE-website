import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { adminDb } from '@/lib/supabase/admin'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const guard = await requireAdmin(request)
  if (guard) return guard

  const { error } = await adminDb()
    .from('contact_messages')
    .update({ is_read: true })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.redirect(new URL('/admin/messages', request.url))
}
