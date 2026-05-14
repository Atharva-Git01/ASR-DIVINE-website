import { createHmac } from 'crypto'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adminDb } from '@/lib/supabase/admin'
import { POST } from '@/app/api/webhooks/razorpay/route'

vi.mock('@/lib/supabase/admin', () => ({
  adminDb: vi.fn(),
}))

const adminDbMock = vi.mocked(adminDb)

function signedRequest({
  body,
  secret,
  signature,
  eventId = 'evt_test_1',
}: {
  body: string
  secret: string
  signature?: string
  eventId?: string
}) {
  return new Request('http://localhost/api/webhooks/razorpay', {
    method: 'POST',
    headers: {
      'x-razorpay-signature': signature ?? createHmac('sha256', secret).update(body).digest('hex'),
      'x-razorpay-event-id': eventId,
    },
    body,
  })
}

function mockProcessedEventInsert(error: unknown) {
  const insert = vi.fn().mockResolvedValue({ error })
  const from = vi.fn(() => ({ insert }))
  adminDbMock.mockReturnValue({ from } as never)
  return { from, insert }
}

describe('Razorpay webhook route', () => {
  const originalEnv = { ...process.env }
  const secret = 'webhook_secret_for_route_tests'
  const body = JSON.stringify({ event: 'payment.captured', payload: {} })

  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.RAZORPAY_WEBHOOK_SECRET = secret
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('fails closed when the webhook secret is missing', async () => {
    delete process.env.RAZORPAY_WEBHOOK_SECRET

    const response = await POST(signedRequest({ body, secret }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toContain('webhook secret')
    expect(adminDbMock).not.toHaveBeenCalled()
  })

  it('rejects invalid signatures before touching the database', async () => {
    const response = await POST(signedRequest({ body, secret, signature: 'bad' }))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBe('Invalid signature')
    expect(adminDbMock).not.toHaveBeenCalled()
  })

  it('returns duplicate success for already processed webhook event ids', async () => {
    mockProcessedEventInsert({ code: '23505', message: 'duplicate key value' })

    const response = await POST(signedRequest({ body, secret }))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json).toEqual({ received: true, duplicate: true })
  })

  it('fails when webhook idempotency recording fails for non-duplicate errors', async () => {
    mockProcessedEventInsert({ code: 'PGRST000', message: 'database unavailable' })

    const response = await POST(signedRequest({ body, secret }))
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toBe('Could not record webhook event')
  })
})
