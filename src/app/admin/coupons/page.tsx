import { adminDb } from '@/lib/supabase/admin'
import { CouponManager } from '@/components/admin/CouponManager'

async function getCoupons() {
  const { data } = await adminDb()
    .from('coupons')
    .select('id, code, discount_type, discount_value, min_order_value, max_uses, used_count, is_active, expires_at')
    .order('created_at', { ascending: false })
  return data ?? []
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons().catch(() => [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-brand-cream">Coupons</h1>
      <CouponManager initialCoupons={coupons} />
    </div>
  )
}
