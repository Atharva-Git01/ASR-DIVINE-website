import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/payment/create-order/route'
import { computeOrderPricing } from '@/lib/payment/pricing'
import type * as PricingModule from '@/lib/payment/pricing'

vi.mock('@/lib/rate-limit', () => ({
  applyRateLimit: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/payment/pricing', async (importOriginal) => {
  const actual = await importOriginal<typeof PricingModule>()
  return {
    ...actual,
    computeOrderPricing: vi.fn(),
  }
})

const computeOrderPricingMock = vi.mocked(computeOrderPricing)

function request(body: unknown) {
  return new Request('http://localhost/api/payment/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('payment create-order route', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = 'rzp_test_valid'
    process.env.RAZORPAY_KEY_SECRET = 'test_secret_valid_value'
    computeOrderPricingMock.mockResolvedValue({
      subtotal: 100,
      deliveryCharge: 80,
      giftWrapCharges: 0,
      discountAmount: 0,
      total: 180,
      coupon: null,
      lines: [{ productId: 'p1', qty: 1, giftWrapped: false, unitPrice: 100 }],
    })
  })

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.unstubAllGlobals()
  })

  it('rejects stale client totals before calling Razorpay', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await POST(
      request({
        items: [{ productId: 'p1', qty: 1, giftWrapped: false }],
        clientTotal: 100,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(409)
    expect(json.error).toContain('Cart total changed')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fails closed when Razorpay order credentials are missing', async () => {
    delete process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

    const response = await POST(
      request({
        items: [{ productId: 'p1', qty: 1, giftWrapped: false }],
        clientTotal: 180,
      })
    )
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toContain('Razorpay key id')
  })
})
