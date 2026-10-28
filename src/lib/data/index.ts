import { isSupabaseConfigured } from '@/lib/db/supabase';
import { memoryListingRepository } from './memory-repository';
import { supabaseListingRepository } from './supabase-repository';
import type { ListingRepository } from './types';

/**
 * Choose the listing backend.
 *
 * Supabase is used whenever it is configured; otherwise the deterministic
 * in-memory fictional dataset keeps the application fully runnable. Both go
 * through the same public projection, so swapping backends cannot change what
 * is or is not public.
 */
export function getListingRepository(): ListingRepository {
  return isSupabaseConfigured() ? supabaseListingRepository : memoryListingRepository;
}

/** True when the app is serving the fictional in-repo dataset. */
export function usingFictionalData(): boolean {
  return !isSupabaseConfigured();
}

export type { ListingRepository, SearchParams, SortKey } from './types';
