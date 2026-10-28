import { isPubliclySearchable } from '@/lib/domain/availability';
import type { PublicListing } from '@/lib/domain/types';
import { allApprovedListings } from './memory-repository';
import { openReportCount } from './reports-store';

/**
 * Admin analytics and operational queues (docs/... §19, §27). The headline is
 * "fresh, available vacancies", not total historical listings.
 */
export interface AdminAnalytics {
  totalApproved: number;
  available: number;
  taken: number;
  overdue: number;
  openReports: number;
}

export function adminAnalytics(now: Date): AdminAnalytics {
  const all = allApprovedListings(now);
  return {
    totalApproved: all.length,
    available: all.filter((l) => isPubliclySearchable(l.availabilityState, l.freshness.status))
      .length,
    taken: all.filter((l) => l.availabilityState === 'taken').length,
    overdue: all.filter(
      (l) => l.freshness.status === 'overdue' || l.freshness.status === 'suppressed',
    ).length,
    openReports: openReportCount(),
  };
}

/** Listings whose availability confirmation is overdue or stale-suppressed. */
export function availabilityQueue(now: Date): PublicListing[] {
  return allApprovedListings(now).filter(
    (l) => l.freshness.status === 'overdue' || l.freshness.status === 'suppressed',
  );
}
