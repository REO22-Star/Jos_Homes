/**
 * Minimal in-memory attempt limiter for sensitive endpoints (sign-in today;
 * inquiry, report, and upload endpoints in later milestones).
 *
 * LIMITATION: state lives in one process, so it does not hold across a
 * multi-instance deployment. Milestone 7 should replace it with a shared store
 * (database or Redis). It is still worth having now: it blunts naive
 * credential-stuffing during the pilot and keeps the call site honest.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now: Date = new Date(),
): RateLimitResult {
  const ms = now.getTime();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= ms) {
    windows.set(key, { count: 1, resetAt: ms + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const allowed = existing.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - ms) / 1000),
  };
}

/** Clear a key after a successful action so honest users are not penalised. */
export function resetRateLimit(key: string): void {
  windows.delete(key);
}

/** Test helper. */
export function __resetAllRateLimits(): void {
  windows.clear();
}
