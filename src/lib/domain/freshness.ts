import { DEFAULT_FRESHNESS_CONFIG, type FreshnessConfig } from './config';
import type { Freshness, FreshnessStatus } from './types';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Classify how fresh a listing's availability confirmation is.
 *
 * `now` is injected so the result is deterministic and testable; callers pass
 * the current server time. Thresholds come from configuration, never inline
 * constants (docs/... section 15).
 */
export function classifyFreshness(
  lastConfirmedAt: Date,
  now: Date,
  config: FreshnessConfig = DEFAULT_FRESHNESS_CONFIG,
): FreshnessStatus {
  const diffMs = now.getTime() - lastConfirmedAt.getTime();
  const hours = diffMs / MS_PER_HOUR;
  const days = diffMs / MS_PER_DAY;

  if (days >= config.suppressDays) return 'suppressed';
  if (days > config.overdueDays) return 'overdue';
  if (hours <= config.freshHours) return 'fresh';
  if (days <= config.recentDays) return 'recent';
  // Between the fresh window and the recent window boundary is still "recent".
  return 'recent';
}

/** Whole days since confirmation, clamped at zero (never negative). */
function wholeDaysAgo(lastConfirmedAt: Date, now: Date): number {
  const diffMs = now.getTime() - lastConfirmedAt.getTime();
  return Math.max(0, Math.floor(diffMs / MS_PER_DAY));
}

/** Human freshness label following docs/CONTENT_AND_COPY.md. */
export function freshnessLabel(status: FreshnessStatus, lastConfirmedAt: Date, now: Date): string {
  if (status === 'overdue' || status === 'suppressed') {
    return 'Confirmation overdue';
  }
  const diffMs = now.getTime() - lastConfirmedAt.getTime();
  const hours = diffMs / MS_PER_HOUR;
  if (hours < 24) return 'Confirmed today';
  if (hours < 48) return 'Confirmed yesterday';
  return `Last confirmed ${wholeDaysAgo(lastConfirmedAt, now)} days ago`;
}

/** Build the full freshness object attached to a public listing. */
export function buildFreshness(
  lastConfirmedAt: Date,
  now: Date,
  config: FreshnessConfig = DEFAULT_FRESHNESS_CONFIG,
): Freshness {
  const status = classifyFreshness(lastConfirmedAt, now, config);
  return {
    status,
    label: freshnessLabel(status, lastConfirmedAt, now),
    lastConfirmedAtISO: lastConfirmedAt.toISOString(),
  };
}
