import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_PATHS = ['/account', '/checkout']
const ADMIN_PATHS = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Refresh Supabase session cookie — gracefully skip if not configured
  let response: NextResponse
  try {
    response = await updateSession(request)
  } catch {
    response = NextResponse.next()
  }

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAdmin = ADMIN_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected || isAdmin) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET }).catch(
      () => null
    )

    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    if (isAdmin && !token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
