import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../../redis/redisClient.js";

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000, // très permissif en dev
    standardHeaders: true,
    legacyHeaders: false
  });
