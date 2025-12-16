import { redis } from "../redis/redisClient.ts";

export const bullConnection = {
  // BullMQ accepte ioredis instance via "connection"
  // On passe les options via URL, ici on réutilise l’instance redis.
  // BullMQ attend un objet de config, mais accepte aussi Redis en interne via "connection".
  // On préfère fournir l’URL pour compatibilité.
  connection: {
    host: new URL(process.env.REDIS_URL!).hostname,
    port: Number(new URL(process.env.REDIS_URL!).port || 6379),
    password: new URL(process.env.REDIS_URL!).password || undefined
  }
};
