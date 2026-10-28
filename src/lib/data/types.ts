import type { PropertyType, PublicListing } from '@/lib/domain/types';

export type SortKey = 'relevance' | 'newest' | 'price_asc' | 'price_desc';

export interface SearchParams {
  area?: string;
  type?: PropertyType;
  /** Whole-naira bounds (inclusive). */
  minRent?: number;
  maxRent?: number;
  /** Minimum bedroom count. */
  beds?: number;
  furnished?: boolean;
  directLandlord?: boolean;
  sort?: SortKey;
}

/**
 * Read surface for public listing data.
 *
 * Every implementation must return only the safe `PublicListing` projection.
 * The Supabase implementation achieves this by reading the `public_listings`
 * view, which is the only listing surface granted to anon/authenticated roles.
 */
export interface ListingRepository {
  readonly name: 'memory' | 'supabase';
  searchAvailable(params: SearchParams, now: Date): Promise<PublicListing[]>;
  getBySlug(slug: string, now: Date): Promise<PublicListing | null>;
  getSimilar(listing: PublicListing, now: Date, limit?: number): Promise<PublicListing[]>;
  getFeatured(now: Date, limit?: number): Promise<PublicListing[]>;
  countAvailable(now: Date): Promise<number>;
}
