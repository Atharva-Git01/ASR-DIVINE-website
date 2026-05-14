import { describe, it, expect } from 'vitest'
import { initTRPC, TRPCError } from '@trpc/server'

// ── Mirror the middleware definitions from router.ts ─────────────────────────

type TRPCContext = {
  userId: string | null
  isAdmin: boolean
}

const t = initTRPC.context<TRPCContext>().create()

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (!ctx.isAdmin) throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// Build a minimal test router
const testRouter = t.router({
  publicHello: t.procedure.query(() => 'public'),
  protectedHello: protectedProcedure.query(() => 'protected'),
  adminHello: adminProcedure.query(() => 'admin'),
})

async function callProcedure(
  path: 'publicHello' | 'protectedHello' | 'adminHello',
  ctx: TRPCContext
) {
  const caller = testRouter.createCaller(ctx)
  return caller[path]()
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('publicProcedure', () => {
  it('is accessible without a session', async () => {
    const result = await callProcedure('publicHello', { userId: null, isAdmin: false })
    expect(result).toBe('public')
  })

  it('is accessible with a regular user session', async () => {
    const result = await callProcedure('publicHello', { userId: 'user-123', isAdmin: false })
    expect(result).toBe('public')
  })
})

describe('protectedProcedure', () => {
  it('throws UNAUTHORIZED when userId is null', async () => {
    await expect(callProcedure('protectedHello', { userId: null, isAdmin: false })).rejects.toThrow(
      TRPCError
    )

    await expect(
      callProcedure('protectedHello', { userId: null, isAdmin: false })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('is accessible when userId is present', async () => {
    const result = await callProcedure('protectedHello', { userId: 'user-123', isAdmin: false })
    expect(result).toBe('protected')
  })
})

describe('adminProcedure', () => {
  it('throws UNAUTHORIZED when userId is null', async () => {
    await expect(
      callProcedure('adminHello', { userId: null, isAdmin: false })
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
  })

  it('throws FORBIDDEN when userId is set but isAdmin is false', async () => {
    await expect(
      callProcedure('adminHello', { userId: 'user-123', isAdmin: false })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' })
  })

  it('throws FORBIDDEN even when isAdmin is false but userId is set', async () => {
    await expect(
      callProcedure('adminHello', { userId: 'another-user', isAdmin: false })
    ).rejects.toThrow(TRPCError)
  })

  it('is accessible when both userId and isAdmin are set', async () => {
    const result = await callProcedure('adminHello', { userId: 'admin-user', isAdmin: true })
    expect(result).toBe('admin')
  })
})
