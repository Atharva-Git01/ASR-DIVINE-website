import { getServerSession } from 'next-auth'
import { authOptions } from './options'
import type { Session } from 'next-auth'

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession()
  if (!session.user.isAdmin) throw new Error('Forbidden')
  return session
}
