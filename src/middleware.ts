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
  // Only run middleware on paths that actually need auth or session refresh.
  // Restricting to these prefixes avoids compiling the middleware bundle on
  // every request (which triggered EvalError in dev mode with eval-source-map).
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    // Keep session refresh for API routes that may need auth state
    '/api/:path*',
  ],
}
