import type { SearchParams } from './types';

/**
 * In-memory seeker data (Milestone 6): saved listings, saved searches, and
 * per-account preferences. Every row is keyed by the seeker's profile id, and
 * the service only ever reads rows for the current user, so one seeker can never
 * see another's saves (acceptance: ownership/privacy).
 */

export interface Favorite {
  profileId: string;
  listingId: string;
  createdAtMs: number;
}

export type AlertFrequency = 'instant' | 'daily' | 'off';

export interface SavedSearch {
  id: string;
  profileId: string;
  name: string;
  filters: SearchParams;
  alertsEnabled: boolean;
  alertFrequency: AlertFrequency;
  createdAtMs: number;
}

export interface SeekerPreferences {
  /** Marketing email opt-in — distinct from operational messages. */
  marketingEmails: boolean;
}

const DEFAULT_PREFERENCES: SeekerPreferences = { marketingEmails: false };

interface SeekerDB {
  favorites: Favorite[];
  searches: SavedSearch[];
  preferences: Map<string, SeekerPreferences>;
  seq: number;
}

const globalRef = globalThis as unknown as { __joshomesSeekerDB?: SeekerDB };

function db(): SeekerDB {
  return (globalRef.__joshomesSeekerDB ??= {
    favorites: [],
    searches: [],
    preferences: new Map(),
    seq: 0,
  });
}

// --- Favorites ---
export function addFavorite(profileId: string, listingId: string, atMs: number): void {
  const store = db();
  if (!store.favorites.some((f) => f.profileId === profileId && f.listingId === listingId)) {
    store.favorites.push({ profileId, listingId, createdAtMs: atMs });
  }
}
export function removeFavorite(profileId: string, listingId: string): void {
  const store = db();
  store.favorites = store.favorites.filter(
    (f) => !(f.profileId === profileId && f.listingId === listingId),
  );
}
export function listFavorites(profileId: string): Favorite[] {
  return db()
    .favorites.filter((f) => f.profileId === profileId)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}
export function isFavorite(profileId: string, listingId: string): boolean {
  return db().favorites.some((f) => f.profileId === profileId && f.listingId === listingId);
}

// --- Saved searches ---
export function addSavedSearch(
  data: Omit<SavedSearch, 'id' | 'createdAtMs'>,
  atMs: number,
): SavedSearch {
  const store = db();
  store.seq += 1;
  const record: SavedSearch = { ...data, id: `srch-${store.seq}`, createdAtMs: atMs };
  store.searches.push(record);
  return record;
}
export function getSavedSearch(id: string): SavedSearch | undefined {
  return db().searches.find((s) => s.id === id);
}
export function removeSavedSearch(id: string): void {
  const store = db();
  store.searches = store.searches.filter((s) => s.id !== id);
}
export function listSavedSearches(profileId: string): SavedSearch[] {
  return db()
    .searches.filter((s) => s.profileId === profileId)
    .sort((a, b) => b.createdAtMs - a.createdAtMs);
}
export function allSavedSearches(): SavedSearch[] {
  return db().searches;
}

// --- Preferences ---
export function getPreferences(profileId: string): SeekerPreferences {
  return db().preferences.get(profileId) ?? { ...DEFAULT_PREFERENCES };
}
export function setPreferences(profileId: string, prefs: SeekerPreferences): void {
  db().preferences.set(profileId, prefs);
}

/** Erase all of one seeker's data (favorites, searches, preferences). */
export function clearProfile(profileId: string): void {
  const store = db();
  store.favorites = store.favorites.filter((f) => f.profileId !== profileId);
  store.searches = store.searches.filter((s) => s.profileId !== profileId);
  store.preferences.delete(profileId);
}

export function __resetSeekerDB(): void {
  const store = db();
  store.favorites = [];
  store.searches = [];
  store.preferences = new Map();
  store.seq = 0;
}
