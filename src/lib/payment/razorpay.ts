import { createHmac, timingSafeEqual } from 'crypto'

export class RazorpayConfigError extends Error {
  constructor(message = 'Razorpay is not configured') {
    super(message)
    this.name = 'RazorpayConfigError'
  }
}

export function getRazorpayOrderConfig(env: NodeJS.ProcessEnv = process.env) {
  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
  const keySecret = env.RAZORPAY_KEY_SECRET ?? ''

  if (!keyId || !keyId.startsWith('rzp_') || keyId === 'rzp_test_placeholder') {
    throw new RazorpayConfigError('Razorpay key id is missing or invalid')
  }
  if (!keySecret || keySecret.toLowerCase().includes('placeholder')) {
    throw new RazorpayConfigError('Razorpay key secret is missing or invalid')
  }

  return { keyId, keySecret }
}

export function getRazorpayWebhookSecret(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.RAZORPAY_WEBHOOK_SECRET ?? ''
  if (!secret || secret.toLowerCase().includes('placeholder')) {
    throw new RazorpayConfigError('Razorpay webhook secret is missing or invalid')
  }
  return secret
}

export function timingSafeEqualHex(left: string, right: string) {
  if (!left || !right) return false

  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')

  if (leftBuffer.length === 0 || leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
  secret,
}: {
  orderId: string
  paymentId: string
  signature: string
  secret: string
}) {
  const expected = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  return timingSafeEqualHex(expected, signature)
}

export function verifyWebhookSignature({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string
  signature: string
  secret: string
}) {
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  return timingSafeEqualHex(expected, signature)
}
