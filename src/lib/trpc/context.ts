import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

export type TRPCContext = {
  userId: string | null
  isAdmin: boolean
}

export async function createContext(req: NextRequest): Promise<TRPCContext> {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    return {
      userId: token?.id ?? null,
      isAdmin: token?.isAdmin ?? false,
    }
  } catch {
    return { userId: null, isAdmin: false }
  }
}
