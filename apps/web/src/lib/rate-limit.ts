import { redis } from "./redis";

export async function rateLimit(ip: string) {
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX = 400; // Maximum requests per minute - generous for normal browsing
  const now = Date.now();
  const key = `rate-limit:${ip}`;

  const requests = await redis.zrange(key, now - RATE_LIMIT_WINDOW, "+inf", {
    byScore: true,
  });

  if (requests.length >= RATE_LIMIT_MAX) {
    throw new Error("Too many requests");
  }

  await redis.zadd(key, { score: now, member: now.toString() });
  await redis.zremrangebyscore(key, 0, now - RATE_LIMIT_WINDOW);
  await redis.expire(key, 60);
}

export async function elevenlabsRateLimit(ip: string) {
  const ELEVENLABS_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const ELEVENLABS_RATE_LIMIT_MAX = 10; // Maximum ElevenLabs requests per minute
  const now = Date.now();
  const key = `elevenlabs-rate-limit:${ip}`;

  const requests = await redis.zrange(
    key,
    now - ELEVENLABS_RATE_LIMIT_WINDOW,
    "+inf",
    {
      byScore: true,
    }
  );

  if (requests.length >= ELEVENLABS_RATE_LIMIT_MAX) {
    throw new Error("Too many ElevenLabs requests");
  }

  await redis.zadd(key, { score: now, member: now.toString() });
  await redis.zremrangebyscore(key, 0, now - ELEVENLABS_RATE_LIMIT_WINDOW);
  await redis.expire(key, 60);
}

export async function searchRateLimit(ip: string) {
  const SEARCH_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const SEARCH_RATE_LIMIT_MAX = 500; // Maximum search requests per minute
  const now = Date.now();
  const key = `search-rate-limit:${ip}`;

  const requests = await redis.zrange(
    key,
    now - SEARCH_RATE_LIMIT_WINDOW,
    "+inf",
    {
      byScore: true,
    }
  );

  if (requests.length >= SEARCH_RATE_LIMIT_MAX) {
    throw new Error("Too many search requests");
  }

  await redis.zadd(key, { score: now, member: now.toString() });
  await redis.zremrangebyscore(key, 0, now - SEARCH_RATE_LIMIT_WINDOW);
  await redis.expire(key, 60);
}
