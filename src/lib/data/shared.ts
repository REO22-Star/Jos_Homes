import type { FreshnessStatus, PublicListing } from '@/lib/domain/types';
import type { SearchParams, SortKey } from './types';

/**
 * Filtering and ordering rules shared by every repository implementation, so
 * the in-memory and Supabase backends behave identically. Freshness thresholds
 * and the product relevance order live in application configuration, not in
 * SQL, so they stay a single source of truth.
 */

const FRESHNESS_RANK: Record<FreshnessStatus, number> = {
  fresh: 0,
  recent: 1,
  overdue: 2,
  suppressed: 3,
};

export function rentMinorOf(listing: PublicListing): number {
  return listing.fees.lines.find((l) => l.key === 'rent')?.amountMinor ?? 0;
}

export function applyFilters(listings: PublicListing[], params: SearchParams): PublicListing[] {
  return listings.filter((l) => {
    if (params.area && l.area.slug !== params.area) return false;
    if (params.type && l.propertyType !== params.type) return false;
    if (params.beds !== undefined && (l.bedrooms ?? 0) < params.beds) return false;
    if (params.furnished && l.furnishingState !== 'furnished') return false;
    if (params.directLandlord && l.lister.listerType !== 'landlord') return false;

    const rentMajor = rentMinorOf(l) / 100;
    if (params.minRent !== undefined && rentMajor < params.minRent) return false;
    if (params.maxRent !== undefined && rentMajor > params.maxRent) return false;
    return true;
  });
}

export function sortListings(listings: PublicListing[], sort: SortKey): PublicListing[] {
  const copy = [...listings];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => rentMinorOf(a) - rentMinorOf(b));
    case 'price_desc':
      return copy.sort((a, b) => rentMinorOf(b) - rentMinorOf(a));
    case 'newest':
      return copy.sort(
        (a, b) =>
          new Date(b.freshness.lastConfirmedAtISO).getTime() -
          new Date(a.freshness.lastConfirmedAtISO).getTime(),
      );
    case 'relevance':
    default:
      // Sponsored first (always labelled), then fresher, then more engaged.
      return copy.sort((a, b) => {
        const sponsored = Number(Boolean(b.sponsorship)) - Number(Boolean(a.sponsorship));
        if (sponsored !== 0) return sponsored;
        const fresh = FRESHNESS_RANK[a.freshness.status] - FRESHNESS_RANK[b.freshness.status];
        if (fresh !== 0) return fresh;
        return b.metrics.qualifiedViews7d - a.metrics.qualifiedViews7d;
      });
  }
}

export function pickSimilar(
  all: PublicListing[],
  listing: PublicListing,
  limit: number,
): PublicListing[] {
  return all
    .filter((l) => l.id !== listing.id)
    .filter((l) => l.area.slug === listing.area.slug || l.propertyType === listing.propertyType)
    .slice(0, limit);
}
