import { getRedisClient } from "@/be/redis";

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const redis = await getRedisClient();
  const redisKey = `rate:${key}`;
  const count = await redis.incr(redisKey);

  if (count === 1) {
    await redis.pExpire(redisKey, windowMs);
  }

  return count <= limit;
}
