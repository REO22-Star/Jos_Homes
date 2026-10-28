import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { __resetSeekerDB } from './seeker-store';
import { __resetNotificationsDB } from './notifications-store';
import { allApprovedListings } from './memory-repository';
import { listMyNotifications } from '@/lib/notifications/service';
import {
  deleteMyData,
  deleteSearch,
  getMyPreferences,
  isSaved,
  listMySearches,
  listSavedListings,
  notifyMatchingSavedSearches,
  saveFavorite,
  saveSearch,
  updateMyPreferences,
} from './seeker';

const now = new Date('2026-07-23T12:00:00.000Z');
const user = (id: string): AuthUser => ({
  id,
  email: `${id}@example.test`,
  displayName: id,
  role: 'seeker',
  accountStatus: 'active',
});
const amina = user('amina');
const bola = user('bola');

afterEach(() => {
  __resetSeekerDB();
  __resetNotificationsDB();
});

describe('saved listings ownership', () => {
  it('a seeker sees only their own saved listings', () => {
    const listing = allApprovedListings(now)[0]!;
    saveFavorite(amina, listing.id, now);
    expect(isSaved(amina, listing.id)).toBe(true);
    expect(isSaved(bola, listing.id)).toBe(false);
    expect(listSavedListings(amina, now).map((l) => l.id)).toContain(listing.id);
    expect(listSavedListings(bola, now)).toHaveLength(0);
  });
});

describe('saved searches ownership', () => {
  it('a seeker cannot delete another seeker’s saved search', () => {
    const search = saveSearch(amina, 'Rayfield 2-bed', { area: 'rayfield', beds: '2' }, now);
    expect(listMySearches(amina)).toHaveLength(1);
    expect(listMySearches(bola)).toHaveLength(0);
    expect(() => deleteSearch(bola, search.id)).toThrow(AuthorizationError);
    expect(deleteSearch(amina, search.id)).toEqual({ ok: true });
  });
});

describe('preferences (marketing distinct from operational)', () => {
  it('defaults marketing off and can be enabled', () => {
    expect(getMyPreferences(amina).marketingEmails).toBe(false);
    updateMyPreferences(amina, { marketingEmails: true });
    expect(getMyPreferences(amina).marketingEmails).toBe(true);
  });
});

describe('data deletion (retention)', () => {
  it('erases the current user’s data but not another user’s', () => {
    const listing = allApprovedListings(now)[0]!;
    saveFavorite(amina, listing.id, now);
    saveSearch(amina, 'A search', { area: 'rayfield' }, now);
    updateMyPreferences(amina, { marketingEmails: true });
    saveFavorite(bola, listing.id, now);

    deleteMyData(amina);

    expect(listSavedListings(amina, now)).toHaveLength(0);
    expect(listMySearches(amina)).toHaveLength(0);
    expect(getMyPreferences(amina).marketingEmails).toBe(false);
    // Bola's data is untouched.
    expect(isSaved(bola, listing.id)).toBe(true);
  });
});

describe('saved-search alerts', () => {
  it('notifies only seekers whose enabled search matches', () => {
    const rayfield = allApprovedListings(now).find((l) => l.area.slug === 'rayfield')!;
    saveSearch(amina, 'Rayfield', { area: 'rayfield' }, now);
    saveSearch(bola, 'Bukuru only', { area: 'bukuru' }, now);

    const sent = notifyMatchingSavedSearches(rayfield, now);
    expect(sent).toBe(1);
    expect(listMyNotifications(amina)).toHaveLength(1);
    expect(listMyNotifications(bola)).toHaveLength(0);
  });
});
