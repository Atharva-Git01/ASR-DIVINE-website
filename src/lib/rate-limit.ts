import { NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type WindowConfig = { requests: number; window: Parameters<typeof Ratelimit.slidingWindow>[1] }

const limiterCache: Map<string, Ratelimit> = new Map()

/**
 * Returns a sliding-window rate limiter backed by Upstash Redis.
 * Returns null gracefully when env vars are not configured (dev/test).
 */
function getLimiter(key: string, cfg: WindowConfig): Ratelimit | null {
  try {
    if (limiterCache.has(key)) return limiterCache.get(key)!
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window),
      prefix: `rl:${key}`,
    })
    limiterCache.set(key, limiter)
    return limiter
  } catch {
    return null
  }
}

/**
 * Apply rate limiting to a route. Returns a 429 Response if the limit is
 * exceeded, or null if the request is allowed (or if Upstash is not configured).
 *
 * @param request  - The incoming Next.js Request
 * @param routeKey - Unique identifier for this route's limiter (e.g. "custom-order")
 * @param cfg      - Sliding-window config: { requests, window } (e.g. { requests: 5, window: '1 m' })
 */
export async function applyRateLimit(
  request: Request,
  routeKey: string,
  cfg: WindowConfig
): Promise<NextResponse | null> {
  const limiter = getLimiter(routeKey, cfg)
  if (!limiter) return null

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests — please try again shortly.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}
