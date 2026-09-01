/**
 * In-memory per-IP rate limiter for public form-intake API routes.
 *
 * Lightweight and per-instance: resets on restart, and each call to
 * `createRateLimiter` gets its own independent counter map — routes that each
 * create one instance never share a budget with one another. Swap for
 * Redis/Upstash for durable, multi-instance production limiting.
 */
import "server-only";

export type RateLimiter = {
  isRateLimited: (ip: string) => boolean;
  /** Test-only: clear all tracked windows. */
  reset: () => void;
};

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return {
    isRateLimited(ip: string): boolean {
      const now = Date.now();
      const entry = hits.get(ip);
      if (!entry || now > entry.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }
      entry.count += 1;
      return entry.count > limit;
    },
    reset(): void {
      hits.clear();
    },
  };
}
