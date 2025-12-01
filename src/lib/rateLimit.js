// lib/rateLimit.js (production version)
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  
  const multi = redis.multi();
  multi.zadd(key, now, now);
  multi.zremrangebyscore(key, 0, now - windowMs);
  multi.zcard(key);
  multi.expire(key, Math.ceil(windowMs / 1000));
  
  const results = await multi.exec();
  const count = results[2][1];
  
  return count <= maxRequests;
}