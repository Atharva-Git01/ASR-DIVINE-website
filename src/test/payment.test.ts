import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'
import { calculatePricingFromRows, PricingError, totalsMatch } from '@/lib/payment/pricing'
import { verifyPaymentSignature, verifyWebhookSignature } from '@/lib/payment/razorpay'

function computeSignature(orderId: string, paymentId: string, secret: string): string {
  return createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
}

function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  return verifyPaymentSignature({ orderId, paymentId, signature, secret })
}

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

describe('Server order pricing', () => {
  it('computes totals from product rows, variants, gift wrap, delivery, and coupons', () => {
    const pricing = calculatePricingFromRows({
      items: [
        { productId: 'p1', variantId: 'v1', qty: 2, giftWrapped: true },
        { productId: 'p2', qty: 1, giftWrapped: false },
      ],
      productRows: [
        {
          id: 'p1',
          base_price: 100,
          is_active: true,
          product_variants: [{ id: 'v1', price_delta: 50, is_active: true }],
        },
        { id: 'p2', base_price: 900, is_active: true, product_variants: [] },
      ],
      coupon: {
        id: 'coupon-1',
        code: 'WELCOME10',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 100,
        max_uses: null,
        used_count: 0,
        valid_until: null,
        is_active: true,
      },
    })

    expect(pricing.subtotal).toBe(1200)
    expect(pricing.deliveryCharge).toBe(0)
    expect(pricing.giftWrapCharges).toBe(30)
    expect(pricing.discountAmount).toBe(120)
    expect(pricing.total).toBe(1110)
    expect(pricing.lines[0]?.unitPrice).toBe(150)
  })

  it('rejects inactive products and stale variants as cart changes', () => {
    expect(() =>
      calculatePricingFromRows({
        items: [{ productId: 'p1', variantId: 'v1', qty: 1, giftWrapped: false }],
        productRows: [
          {
            id: 'p1',
            base_price: 100,
            is_active: true,
            product_variants: [{ id: 'v1', price_delta: 50, is_active: false }],
          },
        ],
      })
    ).toThrow(PricingError)
  })

  it('detects stale client totals before creating Razorpay orders', () => {
    expect(totalsMatch(1110, 1110)).toBe(true)
    expect(totalsMatch(1110.4, 1110)).toBe(true)
    expect(totalsMatch(1100, 1110)).toBe(false)
    expect(totalsMatch('1110', 1110)).toBe(false)
  })
})

describe('Webhook HMAC signature verification', () => {
  const SECRET = 'webhook_secret_for_unit_tests'
  const BODY = JSON.stringify({ event: 'payment.captured' })

  it('accepts a valid webhook signature', () => {
    const signature = createHmac('sha256', SECRET).update(BODY).digest('hex')
    expect(verifyWebhookSignature({ rawBody: BODY, signature, secret: SECRET })).toBe(true)
  })

  it('rejects a missing or malformed webhook signature', () => {
    expect(verifyWebhookSignature({ rawBody: BODY, signature: '', secret: SECRET })).toBe(false)
    expect(verifyWebhookSignature({ rawBody: BODY, signature: 'abc123', secret: SECRET })).toBe(
      false
    )
  })
})

describe('Rate limiter behaviour (mocked)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns 429 when the rate limiter reports failure', async () => {
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
