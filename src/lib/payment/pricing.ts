import { adminDb } from '@/lib/supabase/admin'

export const DELIVERY_THRESHOLD = 999
export const DELIVERY_CHARGE = 80
export const GIFT_WRAP_CHARGE = 30
export const TOTAL_TOLERANCE = 0.5

export type PricingCartItem = {
  productId: string
  variantId?: string | null
  qty: number
  giftWrapped: boolean
}

type PricingVariantRow = {
  id: string
  price_delta: number | string
  is_active: boolean
}

export type PricingProductRow = {
  id: string
  base_price: number | string
  is_active: boolean
  product_variants?: PricingVariantRow[] | null
}

export type PricingCouponRow = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number | string
  min_order_amount: number | string
  max_uses: number | null
  used_count: number
  valid_until: string | null
  is_active: boolean
}

export type PricedLineItem = PricingCartItem & {
  unitPrice: number
}

export type OrderPricing = {
  subtotal: number
  deliveryCharge: number
  giftWrapCharges: number
  discountAmount: number
  total: number
  coupon: { id: string; code: string } | null
  lines: PricedLineItem[]
}

export class PricingError extends Error {
  status: number
  code: string

  constructor(message: string, status = 409, code = 'CART_CHANGED') {
    super(message)
    this.name = 'PricingError'
    this.status = status
    this.code = code
  }
}

export function totalsMatch(clientTotal: unknown, serverTotal: number) {
  if (clientTotal === undefined || clientTotal === null) return true
  if (typeof clientTotal !== 'number' || !Number.isFinite(clientTotal)) return false
  return Math.abs(clientTotal - serverTotal) <= TOTAL_TOLERANCE
}

export function calculatePricingFromRows({
  items,
  productRows,
  coupon,
}: {
  items: PricingCartItem[]
  productRows: PricingProductRow[]
  coupon?: PricingCouponRow | null
}): OrderPricing {
  if (!Array.isArray(items) || items.length === 0) {
    throw new PricingError('Cart is empty', 400, 'EMPTY_CART')
  }

  const productMap = new Map(productRows.map((product) => [product.id, product]))
  const lines: PricedLineItem[] = []
  let subtotal = 0

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.qty) || item.qty < 1) {
      throw new PricingError('Invalid cart item', 400, 'INVALID_CART_ITEM')
    }

    const product = productMap.get(item.productId)
    if (!product || !product.is_active) {
      throw new PricingError('One or more products are no longer available')
    }

    let unitPrice = Number(product.base_price)
    const variantId = item.variantId?.trim()

    if (variantId) {
      const variant = product.product_variants?.find((v) => v.id === variantId && v.is_active)
      if (!variant) {
        throw new PricingError('One or more product variants are no longer available')
      }
      unitPrice += Number(variant.price_delta)
    }

    subtotal += unitPrice * item.qty
    lines.push({ ...item, variantId: variantId || null, unitPrice })
  }

  const deliveryCharge = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const giftWrapCharges = items.filter((item) => item.giftWrapped).length * GIFT_WRAP_CHARGE
  const appliedCoupon = validateCoupon(coupon, subtotal)
  const discountAmount = appliedCoupon.discountAmount
  const total = subtotal + deliveryCharge + giftWrapCharges - discountAmount

  return {
    subtotal,
    deliveryCharge,
    giftWrapCharges,
    discountAmount,
    total,
    coupon: appliedCoupon.coupon,
    lines,
  }
}

export async function computeOrderPricing({
  items,
  couponCode,
}: {
  items: PricingCartItem[]
  couponCode?: string | null
}): Promise<OrderPricing> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new PricingError('Cart is empty', 400, 'EMPTY_CART')
  }

  const productIds = Array.from(new Set(items.map((item) => item.productId).filter(Boolean)))
  const supabase = adminDb()

  const { data: productRows, error: productError } = await supabase
    .from('products')
    .select('id, base_price, is_active, product_variants(id, price_delta, is_active)')
    .in('id', productIds)

  if (productError || !productRows) {
    throw new PricingError('Could not verify product prices', 500, 'PRICING_UNAVAILABLE')
  }

  let coupon: PricingCouponRow | null = null
  const normalizedCoupon = couponCode?.trim().toUpperCase()

  if (normalizedCoupon) {
    const { data, error } = await supabase
      .from('coupons')
      .select(
        'id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_until, is_active'
      )
      .eq('code', normalizedCoupon)
      .eq('is_active', true)
      .maybeSingle()

    if (error || !data) {
      throw new PricingError('Coupon is no longer valid')
    }
    coupon = data as PricingCouponRow
  }

  return calculatePricingFromRows({
    items,
    productRows: productRows as PricingProductRow[],
    coupon,
  })
}

function validateCoupon(coupon: PricingCouponRow | null | undefined, subtotal: number) {
  if (!coupon) return { discountAmount: 0, coupon: null }

  const now = new Date()
  const isExpired = coupon.valid_until ? new Date(coupon.valid_until) <= now : false
  const isUsedUp = coupon.max_uses !== null && coupon.used_count >= coupon.max_uses
  const isBelowMinimum = subtotal < Number(coupon.min_order_amount)

  if (!coupon.is_active || isExpired || isUsedUp || isBelowMinimum) {
    throw new PricingError('Coupon is no longer valid')
  }

  const discountAmount =
    coupon.discount_type === 'percentage'
      ? Math.min(Math.round((subtotal * Number(coupon.discount_value)) / 100), subtotal)
      : Math.min(Number(coupon.discount_value), subtotal)

  return {
    discountAmount,
    coupon: { id: coupon.id, code: coupon.code },
  }
}
