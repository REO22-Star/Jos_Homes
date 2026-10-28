'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { AuthorizationError } from '@/lib/domain/authorization';
import type { RawSearchParams } from '@/lib/data/search-params';
import {
  deleteMyData,
  deleteSearch,
  isSaved,
  saveFavorite,
  saveSearch,
  toggleSearchAlerts,
  unsaveFavorite,
  updateMyPreferences,
} from '@/lib/data/seeker';
import { getNow } from '@/lib/now';

export interface FavoriteState {
  saved?: boolean;
  error?: string;
}
export interface SeekerState {
  ok?: boolean;
  message?: string;
  error?: string;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

const FILTER_KEYS = [
  'area',
  'type',
  'minRent',
  'maxRent',
  'beds',
  'furnished',
  'directLandlord',
  'sort',
];

export async function toggleFavoriteAction(
  listingId: string,
  _prev: FavoriteState,
  _formData: FormData,
): Promise<FavoriteState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Please sign in to save homes.' };
  if (isSaved(user, listingId)) {
    unsaveFavorite(user, listingId);
    revalidatePath('/dashboard/saved');
    return { saved: false };
  }
  saveFavorite(user, listingId, getNow());
  revalidatePath('/dashboard/saved');
  return { saved: true };
}

export async function saveSearchAction(
  _prev: SeekerState,
  formData: FormData,
): Promise<SeekerState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Please sign in to save a search.' };
  const raw: RawSearchParams = {};
  for (const key of FILTER_KEYS) {
    const value = str(formData, key);
    if (value) raw[key] = value;
  }
  saveSearch(user, str(formData, 'name'), raw, getNow());
  revalidatePath('/dashboard/searches');
  return { ok: true, message: 'Search saved. You will be alerted about matching homes.' };
}

export async function deleteSearchAction(
  searchId: string,
  _prev: SeekerState,
  _formData: FormData,
): Promise<SeekerState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    deleteSearch(user, searchId);
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: 'You do not have permission to do that.' };
    throw e;
  }
  revalidatePath('/dashboard/searches');
  return { ok: true, message: 'Search removed.' };
}

export async function toggleAlertsAction(
  searchId: string,
  _prev: SeekerState,
  formData: FormData,
): Promise<SeekerState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    toggleSearchAlerts(user, searchId, str(formData, 'enabled') === 'true');
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: 'You do not have permission to do that.' };
    throw e;
  }
  revalidatePath('/dashboard/searches');
  return { ok: true, message: 'Alerts updated.' };
}

export async function updatePreferencesAction(
  _prev: SeekerState,
  formData: FormData,
): Promise<SeekerState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  updateMyPreferences(user, { marketingEmails: formData.get('marketingEmails') === 'on' });
  revalidatePath('/dashboard/preferences');
  return { ok: true, message: 'Preferences saved.' };
}

export async function deleteMyDataAction(
  _prev: SeekerState,
  _formData: FormData,
): Promise<SeekerState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  deleteMyData(user);
  revalidatePath('/dashboard/saved');
  revalidatePath('/dashboard/searches');
  revalidatePath('/dashboard/notifications');
  return { ok: true, message: 'Your saved homes, searches, and notifications were deleted.' };
}
