import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Server-side admin guard for all /api/admin/* route handlers.
 * Returns a NextResponse error if the request is not from an admin,
 * or null if the request is authorised to proceed.
 *
 * Usage:
 *   const guard = await requireAdmin(request)
 *   if (guard) return guard
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }).catch(() => null)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!token.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  return null
}
