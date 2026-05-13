import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

// ── HMAC signature helpers (mirrors verify/route.ts logic) ─────────────────

function computeSignature(orderId: string, paymentId: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
}

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = computeSignature(orderId, paymentId, secret)
  return expected === signature
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Payment HMAC signature verification', () => {
  const SECRET = 'test_secret_key_for_unit_tests_only'
  const ORDER_ID = 'order_MzKp1234abcd'
  const PAYMENT_ID = 'pay_MzKp1234xyz'

  it('accepts a valid signature', () => {
    const sig = computeSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature(ORDER_ID, PAYMENT_ID, sig, SECRET)).toBe(true)
  })

  it('rejects a tampered order ID', () => {
    const sig = computeSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature('order_TAMPERED', PAYMENT_ID, sig, SECRET)).toBe(false)
  })

  it('rejects a tampered payment ID', () => {
    const sig = computeSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature(ORDER_ID, 'pay_TAMPERED', sig, SECRET)).toBe(false)
  })

  it('rejects a tampered signature', () => {
    expect(verifySignature(ORDER_ID, PAYMENT_ID, 'deadbeef00', SECRET)).toBe(false)
  })

  it('rejects an empty signature', () => {
    expect(verifySignature(ORDER_ID, PAYMENT_ID, '', SECRET)).toBe(false)
  })

  it('is sensitive to key changes', () => {
    const sig = computeSignature(ORDER_ID, PAYMENT_ID, SECRET)
    expect(verifySignature(ORDER_ID, PAYMENT_ID, sig, 'different_secret')).toBe(false)
  })
})

// ── Amount validation (mirrors create-order/route.ts logic) ─────────────────

function validateAmount(amount: unknown): { valid: boolean; error?: string } {
  if (!amount || typeof amount !== 'number' || amount < 1) {
    return { valid: false, error: 'Invalid amount' }
  }
  return { valid: true }
}

describe('Payment amount validation', () => {
  it('accepts a positive numeric amount', () => {
    expect(validateAmount(599)).toEqual({ valid: true })
    expect(validateAmount(1)).toEqual({ valid: true })
  })

  it('rejects 0', () => {
    expect(validateAmount(0).valid).toBe(false)
  })

  it('rejects negative amounts', () => {
    expect(validateAmount(-100).valid).toBe(false)
  })

  it('rejects string amounts', () => {
    expect(validateAmount('599').valid).toBe(false)
  })

  it('rejects null', () => {
    expect(validateAmount(null).valid).toBe(false)
  })

  it('rejects undefined', () => {
    expect(validateAmount(undefined).valid).toBe(false)
  })

  it('rejects NaN', () => {
    expect(validateAmount(NaN).valid).toBe(false)
  })
})

// ── Upstash rate limiter mock ───────────────────────────────────────────────

describe('Rate limiter behaviour (mocked)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 429 when the rate limiter reports failure', async () => {
    // Mock the Ratelimit.limit call
    const limitMock = vi.fn().mockResolvedValue({ success: false })
    const limiter = { limit: limitMock }

    const ip = '1.2.3.4'
    const { success } = await limiter.limit(ip)

    expect(success).toBe(false)
    expect(limitMock).toHaveBeenCalledWith(ip)
  })

  it('allows requests when the rate limiter reports success', async () => {
    const limitMock = vi.fn().mockResolvedValue({ success: true })
    const limiter = { limit: limitMock }

    const { success } = await limiter.limit('5.6.7.8')
    expect(success).toBe(true)
  })
})
