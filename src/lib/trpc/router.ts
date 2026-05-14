import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminDb } from '@/lib/supabase/admin'
import type { TRPCContext } from './context'

const t = initTRPC.context<TRPCContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  if (!ctx.isAdmin) throw new TRPCError({ code: 'FORBIDDEN' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})

// Convenience wrapper — returns the shared service-role Supabase client
const db = () => adminDb()

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: 'ok' as const })),

  // ── Products ────────────────────────────────────────────────
  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            search: z.string().optional(),
            page: z.number().min(1).default(1),
            limit: z.number().min(1).max(50).default(12),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const supabase = db()
        const page = input?.page ?? 1
        const limit = input?.limit ?? 12
        const from = (page - 1) * limit

        let query = supabase
          .from('products')
          .select('*, categories(name, slug), product_images(storage_path, alt_text, sort_order)', {
            count: 'exact',
          })
          .eq('is_active', true)
          .order('name')
          .range(from, from + limit - 1)

        if (input?.category) query = query.eq('categories.slug', input.category)
        if (input?.search) query = query.textSearch('search_vector', input.search)

        const { data, count, error } = await query
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { items: data ?? [], total: count ?? 0 }
      }),

    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const { data, error } = await db()
        .from('products')
        .select('*, categories(name, slug), product_images(*), product_variants(*)')
        .eq('slug', input.slug)
        .eq('is_active', true)
        .single()
      if (error || !data) throw new TRPCError({ code: 'NOT_FOUND' })
      return data
    }),
  }),

  // ── Categories ──────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      const { data } = await db()
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      return data ?? []
    }),
  }),

  // ── Profile ─────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { data } = await db().from('profiles').select('*').eq('id', ctx.userId).single()
      return data
    }),

    update: protectedProcedure
      .input(
        z.object({
          fullName: z.string().min(1).optional(),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { error } = await db()
          .from('profiles')
          .update({
            full_name: input.fullName,
            phone: input.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.userId)
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { success: true }
      }),
  }),

  // ── Addresses ───────────────────────────────────────────────
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { data } = await db()
        .from('addresses')
        .select('*')
        .eq('user_id', ctx.userId)
        .order('is_default', { ascending: false })
      return data ?? []
    }),

    create: protectedProcedure
      .input(
        z.object({
          label: z.string().default('Home'),
          line1: z.string().min(1),
          line2: z.string().optional(),
          city: z.string().default('Pune'),
          state: z.string().default('Maharashtra'),
          pincode: z.string().regex(/^\d{6}$/),
          isDefault: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const supabase = db()
        if (input.isDefault) {
          await supabase.from('addresses').update({ is_default: false }).eq('user_id', ctx.userId)
        }
        const { data, error } = await supabase
          .from('addresses')
          .insert({
            user_id: ctx.userId,
            label: input.label,
            line1: input.line1,
            line2: input.line2,
            city: input.city,
            state: input.state,
            pincode: input.pincode,
            is_default: input.isDefault,
          })
          .select('id')
          .single()
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { id: data.id }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { error } = await db()
          .from('addresses')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { success: true }
      }),
  }),

  // ── Coupons ─────────────────────────────────────────────────
  coupons: router({
    validate: publicProcedure
      .input(
        z.object({
          code: z.string().min(1),
          subtotal: z.number().min(0),
        })
      )
      .mutation(async ({ input }) => {
        const { data, error } = await db()
          .from('coupons')
          .select(
            'id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_until, is_active'
          )
          .eq('code', input.code.toUpperCase().trim())
          .eq('is_active', true)
          .maybeSingle()

        if (error || !data) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid coupon code' })
        }
        if (data.valid_until && new Date(data.valid_until) < new Date()) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'This coupon has expired' })
        }
        if (data.max_uses !== null && data.used_count >= data.max_uses) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This coupon has reached its usage limit',
          })
        }
        if (input.subtotal < Number(data.min_order_amount)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Minimum order of ₹${Number(data.min_order_amount).toLocaleString('en-IN')} required for this coupon`,
          })
        }

        const discount =
          data.discount_type === 'percentage'
            ? Math.min(
                Math.round((input.subtotal * Number(data.discount_value)) / 100),
                input.subtotal
              )
            : Math.min(Number(data.discount_value), input.subtotal)

        return {
          couponId: data.id as string,
          code: data.code as string,
          discountType: data.discount_type as 'percentage' | 'fixed',
          discountValue: Number(data.discount_value),
          discountAmount: discount,
        }
      }),
  }),

  // ── Delivery ────────────────────────────────────────────
  delivery: router({
    checkPincode: publicProcedure
      .input(z.object({ pincode: z.string().regex(/^\d{6}$/, 'Must be a 6-digit pincode') }))
      .query(async ({ input }) => {
        const { data } = await db()
          .from('delivery_zones')
          .select('zone_name, delivery_type, delivery_days, extra_charge')
          .eq('pincode', input.pincode)
          .eq('is_active', true)
          .maybeSingle()

        if (!data || data.delivery_type === 'unavailable') {
          return {
            serviceable: false as const,
            message: "Sorry, we don't deliver to this pincode yet.",
          }
        }

        const typeLabel =
          data.delivery_type === 'local' ? 'Bakery delivery' : 'Courier (dry goods only)'

        return {
          serviceable: true as const,
          deliveryType: data.delivery_type as 'local' | 'courier',
          zoneName: data.zone_name as string,
          deliveryDays: data.delivery_days as number,
          extraCharge: Number(data.extra_charge),
          message: `${typeLabel} · ${data.zone_name} · ${data.delivery_days === 1 ? 'Same/next day' : `${data.delivery_days} days`}`,
        }
      }),
  }),

  // ── Orders ──────────────────────────────────────────────────
  orders: router({
    list: protectedProcedure
      .input(z.object({ page: z.number().min(1).default(1) }).optional())
      .query(async ({ ctx, input }) => {
        const page = input?.page ?? 1
        const limit = 10
        const from = (page - 1) * limit
        const { data, count, error } = await db()
          .from('orders')
          .select('*, order_items(*)', { count: 'exact' })
          .eq('user_id', ctx.userId)
          .order('created_at', { ascending: false })
          .range(from, from + limit - 1)
        if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
        return { items: data ?? [], total: count ?? 0 }
      }),

    byId: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { data, error } = await db()
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', input.id)
          .eq('user_id', ctx.userId)
          .single()
        if (error || !data) throw new TRPCError({ code: 'NOT_FOUND' })
        return data
      }),
  }),
})

export type AppRouter = typeof appRouter
