import { redis } from "../redis/redisClient.ts";

export async function cacheGet<T>(key: string): Promise<T | null> {
  const v = await redis.get(key);
  if (!v) return null;
  return JSON.parse(v) as T;
}

export async function cacheSet(key: string, value: any, ttlSeconds: number) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheDel(pattern: string) {
  // Supprime par pattern (attention prod : scan)
  let cursor = "0";
  do {
    const [next, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", "100");
    cursor = next;
    if (keys.length) await redis.del(keys);
  } while (cursor !== "0");
}
