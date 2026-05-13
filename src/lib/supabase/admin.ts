import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Lazily-initialised service-role Supabase client.
 * A single instance is reused across the serverless function lifetime,
 * avoiding connection overhead on every tRPC / API invocation.
 */
let _client: SupabaseClient | null = null

export function adminDb(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}
