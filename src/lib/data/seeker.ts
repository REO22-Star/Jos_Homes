import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { isPubliclySearchable } from '@/lib/domain/availability';
import type { PublicListing } from '@/lib/domain/types';
import { notify } from '@/lib/notifications/service';
import { appendAudit } from './authoring-store';
import { clearNotifications } from './notifications-store';
import { allApprovedListings } from './memory-repository';
import { parseSearchParams, type RawSearchParams } from './search-params';
import { applyFilters } from './shared';
import * as store from './seeker-store';
import type { SavedSearch, SeekerPreferences } from './seeker-store';

/**
 * Seeker service: saved listings, saved searches, alerts, and preferences.
 * Every operation is scoped to the current user, so one seeker can never read or
 * change another seeker's data (acceptance: ownership/privacy).
 */

// --- Saved listings ---
export function saveFavorite(user: AuthUser, listingId: string, now: Date): void {
  store.addFavorite(user.id, listingId, now.getTime());
}
export function unsaveFavorite(user: AuthUser, listingId: string): void {
  store.removeFavorite(user.id, listingId);
}
export function isSaved(user: AuthUser, listingId: string): boolean {
  return store.isFavorite(user.id, listingId);
}
export function listSavedListings(user: AuthUser, now: Date): PublicListing[] {
  return allApprovedListings(now).filter((l) => store.isFavorite(user.id, l.id));
}

// --- Saved searches ---
export function saveSearch(
  user: AuthUser,
  name: string,
  raw: RawSearchParams,
  now: Date,
): SavedSearch {
  return store.addSavedSearch(
    {
      profileId: user.id,
      name: name.trim() || 'My search',
      filters: parseSearchParams(raw),
      alertsEnabled: true,
      alertFrequency: 'instant',
    },
    now.getTime(),
  );
}
export function listMySearches(user: AuthUser): SavedSearch[] {
  return store.listSavedSearches(user.id);
}
function ownedSearch(user: AuthUser, id: string): SavedSearch {
  const search = store.getSavedSearch(id);
  if (!search || search.profileId !== user.id) throw new AuthorizationError();
  return search;
}
export function deleteSearch(user: AuthUser, id: string): { ok: true } {
  ownedSearch(user, id);
  store.removeSavedSearch(id);
  return { ok: true };
}
export function toggleSearchAlerts(user: AuthUser, id: string, enabled: boolean): { ok: true } {
  const search = ownedSearch(user, id);
  search.alertsEnabled = enabled;
  return { ok: true };
}

// --- Preferences ---
export function getMyPreferences(user: AuthUser): SeekerPreferences {
  return store.getPreferences(user.id);
}
export function updateMyPreferences(user: AuthUser, prefs: SeekerPreferences): void {
  store.setPreferences(user.id, prefs);
}

// --- Data deletion (retention/GDPR-style self-service, docs OQ-013) ---
/** Erase the current user's saved homes, searches, preferences, and notifications. */
export function deleteMyData(user: AuthUser): { ok: true } {
  store.clearProfile(user.id);
  clearNotifications(user.id);
  appendAudit(
    {
      actorId: user.id,
      action: 'seeker.delete_data',
      targetType: 'profile',
      targetId: user.id,
      summary: null,
    },
    new Date().toISOString(),
  );
  return { ok: true };
}

// --- Saved-search alerts ---
/**
 * Notify seekers whose enabled saved search matches a newly public listing.
 * Called after a moderator approves a listing. Alerts are "alert" category —
 * requested by the seeker, so always delivered (not gated by marketing opt-in).
 */
export function notifyMatchingSavedSearches(listing: PublicListing, now: Date): number {
  if (!isPubliclySearchable(listing.availabilityState, listing.freshness.status)) return 0;
  let sent = 0;
  for (const search of store.allSavedSearches()) {
    if (!search.alertsEnabled) continue;
    if (applyFilters([listing], search.filters).length === 0) continue;
    const delivered = notify(
      {
        recipientProfileId: search.profileId,
        category: 'alert',
        title: 'A new home matches your saved search',
        body: `“${listing.title}” in ${listing.area.name} matches “${search.name}”.`,
        listingSlug: listing.slug,
      },
      now,
    );
    if (delivered) sent += 1;
  }
  return sent;
}
