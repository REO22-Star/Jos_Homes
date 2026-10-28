import { isPubliclySearchable } from '@/lib/domain/availability';
import { toPublicListing } from '@/lib/domain/projection';
import type { InternalListing } from '@/lib/domain/internal-types';
import type { PublicListing } from '@/lib/domain/types';
import { approvedRecords } from './authoring-store';
import { metricsFor } from './engagement';
import { validBadgesForProfile } from './verification';
import { SEED_LISTINGS, type SeedListing } from './seed';
import { applyFilters, pickSimilar, sortListings } from './shared';
import type { ListingRepository, SearchParams } from './types';

/**
 * In-memory repository over the deterministic fictional seed.
 *
 * This is the default backend when Supabase is not configured, so the app is
 * always runnable. It goes through exactly the same public projection as the
 * Supabase backend, so the privacy boundary is identical.
 */

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Convert time-relative seed offsets into absolute values against `now`. */
function materialize(seed: SeedListing, now: Date): InternalListing {
  const { confirmedHoursAgo, availableFromDaysFromNow, ...rest } = seed;
  const lastConfirmedAt = new Date(now.getTime() - confirmedHoursAgo * MS_PER_HOUR);
  const availableFromISO =
    availableFromDaysFromNow === null
      ? null
      : new Date(now.getTime() + availableFromDaysFromNow * MS_PER_DAY).toISOString().slice(0, 10);
  return { ...rest, lastConfirmedAt, availableFromISO };
}

/**
 * Only workflow-approved records are ever visible publicly (acceptance A3).
 * Combines the static demo seed with any listings approved at runtime through
 * the authoring/moderation flow (Milestone 2). Both go through the same public
 * projection, so the privacy boundary is identical.
 */
function approvedPublic(now: Date): PublicListing[] {
  const seeded = SEED_LISTINGS.map((seed) => materialize(seed, now)).filter(
    (l) => l.workflowState === 'approved',
  );
  // Authored listings get their live aggregate metrics from the engagement
  // store and their lister badges from valid verification records.
  const authored = approvedRecords().map((r) => {
    const m = metricsFor(r.id, now);
    const verifications = validBadgesForProfile(r.assignedListerId, now).map((type) => ({
      type,
      status: 'active' as const,
      expiresAtISO: null,
      revokedAtISO: null,
      evidencePath: null,
    }));
    return {
      ...r,
      qualifiedViews7d: m.qualifiedViews7d,
      inquiries7d: m.inquiries7d,
      lister: { ...r.lister, verifications },
    };
  });
  return [...seeded, ...authored].map((l) => toPublicListing(l, now));
}

/** All approved public listings (any availability) — for admin analytics/queues. */
export function allApprovedListings(now: Date): PublicListing[] {
  return approvedPublic(now);
}

function searchableNow(now: Date): PublicListing[] {
  return approvedPublic(now).filter((l) =>
    isPubliclySearchable(l.availabilityState, l.freshness.status),
  );
}

export const memoryListingRepository: ListingRepository = {
  name: 'memory',

  async searchAvailable(params: SearchParams, now: Date): Promise<PublicListing[]> {
    return sortListings(applyFilters(searchableNow(now), params), params.sort ?? 'relevance');
  },

  async getBySlug(slug: string, now: Date): Promise<PublicListing | null> {
    return approvedPublic(now).find((l) => l.slug === slug) ?? null;
  },

  async getSimilar(listing: PublicListing, now: Date, limit = 3): Promise<PublicListing[]> {
    return pickSimilar(sortListings(searchableNow(now), 'relevance'), listing, limit);
  },

  async getFeatured(now: Date, limit = 6): Promise<PublicListing[]> {
    return sortListings(searchableNow(now), 'relevance').slice(0, limit);
  },

  async countAvailable(now: Date): Promise<number> {
    return searchableNow(now).length;
  },
};
