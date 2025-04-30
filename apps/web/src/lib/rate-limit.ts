import { redis } from './redis'

export async function rateLimit(ip: string) {
  const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
  const RATE_LIMIT_MAX = 30 // Maximum requests per minute
  const now = Date.now()
  const key = `rate-limit:${ip}`

  const requests = await redis.zrange(key, now - RATE_LIMIT_WINDOW, '+inf', {
    byScore: true
  })

  if (requests.length >= RATE_LIMIT_MAX) {
    throw new Error('Too many requests')
  }

  await redis.zadd(key, { score: now, member: now.toString() })
  await redis.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW)
  await redis.expire(key, 60)
}

export async function audioRateLimit(ip: string) {
  const AUDIO_RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
  const AUDIO_RATE_LIMIT_MAX = 10 // Maximum audio requests per minute
  const now = Date.now()
  const key = `audio-rate-limit:${ip}`

  const requests = await redis.zrange(key, now - AUDIO_RATE_LIMIT_WINDOW, '+inf', {
    byScore: true
  })

  if (requests.length >= AUDIO_RATE_LIMIT_MAX) {
    throw new Error('Too many audio requests')
  }

  await redis.zadd(key, { score: now, member: now.toString() })
  await redis.zremrangebyscore(key, 0, now - AUDIO_RATE_LIMIT_WINDOW)
  await redis.expire(key, 60)
}