type RateLimiterOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  resetAt: number;
  limit: number;
};

export type InMemoryRateLimiter = {
  consume: (key: string) => RateLimitResult;
  clear: () => void;
};

export function createInMemoryRateLimiter(options: RateLimiterOptions): InMemoryRateLimiter {
  const buckets = new Map<string, Bucket>();
  const now = options.now ?? Date.now;

  return {
    consume(key: string) {
      const currentTime = now();
      const current = buckets.get(key);

      if (!current || currentTime >= current.resetAt) {
        const resetAt = currentTime + options.windowMs;
        buckets.set(key, { count: 1, resetAt });
        return {
          allowed: true,
          remaining: Math.max(0, options.limit - 1),
          retryAfterSec: 0,
          resetAt,
          limit: options.limit
        };
      }

      if (current.count >= options.limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.max(1, Math.ceil((current.resetAt - currentTime) / 1000)),
          resetAt: current.resetAt,
          limit: options.limit
        };
      }

      current.count += 1;
      buckets.set(key, current);

      return {
        allowed: true,
        remaining: Math.max(0, options.limit - current.count),
        retryAfterSec: 0,
        resetAt: current.resetAt,
        limit: options.limit
      };
    },

    clear() {
      buckets.clear();
    }
  };
}

const DEFAULT_LIMIT = Number(process.env.PUBLIC_TRYON_RATE_LIMIT ?? "10");
const DEFAULT_WINDOW_MS = Number(process.env.PUBLIC_TRYON_RATE_LIMIT_WINDOW_MS ?? "60000");

export const publicTryOnRateLimiter = createInMemoryRateLimiter({
  limit: Number.isFinite(DEFAULT_LIMIT) && DEFAULT_LIMIT > 0 ? DEFAULT_LIMIT : 10,
  windowMs: Number.isFinite(DEFAULT_WINDOW_MS) && DEFAULT_WINDOW_MS > 0 ? DEFAULT_WINDOW_MS : 60_000
});
