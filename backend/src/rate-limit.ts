
import { createHash } from 'node:crypto'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const REQUEST_LIMIT = 10
const WINDOW_MS = 60_000

const memoryStore = new Map<
  string,
  {
    count: number
    resetAt: number
  }
>()

let distributedLimiter: Ratelimit | null = null

export class RateLimitUnavailableError extends Error {
  constructor() {
    super('Rate limit indisponível.')
    this.name = 'RateLimitUnavailableError'
  }
}

function getDistributedLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  const isDeployed =
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview'

  if (url && token) {
    if (!distributedLimiter) {
      distributedLimiter = new Ratelimit({
        redis: new Redis({
          url,
          token,
        }),
        limiter: Ratelimit.slidingWindow(
          REQUEST_LIMIT,
          '1 m',
        ),
        prefix: 'via:describe',
        analytics: false,
      })
    }

    return distributedLimiter
  }

  if (url || token || isDeployed) {
    throw new RateLimitUnavailableError()
  }

  return null
}

export async function consumeRateLimit(clientIp: string) {
  const identifier = createHash('sha256')
    .update(clientIp)
    .digest('hex')

  const limiter = getDistributedLimiter()

  if (limiter) {
    try {
      const result = await limiter.limit(identifier)

      return {
        allowed: result.success,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((result.reset - Date.now()) / 1000),
        ),
      }
    }catch (error) {
        console.error('[VIA] Falha original no Upstash:', {
          name: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        })

        throw new RateLimitUnavailableError()
      }
    }


  const now = Date.now()

  if (memoryStore.size > 5000) {
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt <= now) {
        memoryStore.delete(key)
      }
    }
  }

  const current = memoryStore.get(identifier)

  if (!current || current.resetAt <= now) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    })

    return {
      allowed: true,
      retryAfterSeconds: 0,
    }
  }

  if (current.count >= REQUEST_LIMIT) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    }
  }

  current.count += 1

  return {
    allowed: true,
    retryAfterSeconds: 0,
  }
}
