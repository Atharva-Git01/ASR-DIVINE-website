import { z } from 'zod'

/**
 * Validates all required environment variables at module load time.
 * Import `env` anywhere instead of `process.env.X!` to get type-safe,
 * validated access and a clear error message on misconfiguration.
 *
 * Validation runs on the server only — client-side code may only access
 * NEXT_PUBLIC_* variables.
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

  // Google OAuth (optional — falls back to credentials only)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Razorpay
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1, 'NEXT_PUBLIC_RAZORPAY_KEY_ID is required'),
  RAZORPAY_KEY_SECRET: z.string().min(10, 'RAZORPAY_KEY_SECRET must be at least 10 characters'),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1, 'RAZORPAY_WEBHOOK_SECRET is required'),

  // Upstash Redis rate limiting (optional — disabled gracefully when absent)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Notifications (optional — skip silently with placeholder values)
  RESEND_API_KEY: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),

  // Sentry (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
})

// Use safeParse so we can show a readable error without crashing the import
const parsed = envSchema.safeParse(process.env)

if (!parsed.success && typeof window === 'undefined') {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n')
  // eslint-disable-next-line no-console
  console.error(`\n[env] Missing or invalid environment variables:\n${issues}\n`)
  // Don't throw at build time — Next.js builds without all runtime vars.
  // The error will surface at request time when the missing var is actually used.
}

export const env = (parsed.success ? parsed.data : process.env) as z.infer<typeof envSchema>
