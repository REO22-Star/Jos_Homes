import { createAnonClient } from '@/lib/db/supabase';
import { isPubliclySearchable } from '@/lib/domain/availability';
import { buildFeeSummary } from '@/lib/domain/fees';
import { buildFreshness } from '@/lib/domain/freshness';
import type {
  AvailabilityState,
  FeeDisclosureState,
  FurnishingState,
  ListerType,
  MediaKind,
  PropertyType,
  PublicListing,
  PublicMedia,
  RentFrequency,
  VerificationType,
} from '@/lib/domain/types';
import { applyFilters, pickSimilar, sortListings } from './shared';
import type { ListingRepository, SearchParams } from './types';

/**
 * Supabase-backed repository.
 *
 * Reads ONLY from the `public_listings` view using the anon key, so the private
 * address, evidence paths, raw phone numbers, and unapproved media are
 * unreachable by construction (supabase/migrations/0002_public_view.sql).
 *
 * Coarse filters are pushed into SQL; freshness classification, stale
 * suppression, and the product relevance order are applied in application code
 * so their thresholds remain a single source of truth in configuration.
 */

interface ViewMedia {
  id: string;
  kind: MediaKind;
  alt: string;
  caption: string | null;
}

interface PublicListingRow {
  id: string;
  slug: string;
  reference_code: string;
  title: string;
  description: string;
  availability_state: AvailabilityState;
  last_confirmed_at: string | null;
  available_from: string | null;

  rent_amount_minor: number;
  rent_frequency: RentFrequency;
  agency_fee_minor: number | null;
  legal_fee_minor: number | null;
  caution_fee_minor: number | null;
  service_charge_minor: number | null;
  other_fee_minor: number | null;
  other_fee_label: string | null;
  fees_disclosure_state: FeeDisclosureState;
  sponsorship_label: string | null;

  area_name: string;
  area_slug: string;
  public_landmark: string | null;
  approx_location_label: string | null;

  property_type: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parking_spaces: number | null;
  furnishing_state: FurnishingState;
  water_source: string | null;
  electricity_meter: string | null;
  features: string[] | null;
  house_rules: string[] | null;

  lister_slug: string;
  lister_display_name: string;
  lister_type: ListerType;

  media: ViewMedia[] | null;
  lister_badges: VerificationType[] | null;
}

/**
 * Stable hue for a placeholder tile. Real responsive image delivery arrives in
 * Milestone 3; until then media renders as a deterministic placeholder.
 */
function hueFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  return hash;
}

function mapMedia(media: ViewMedia[] | null): PublicMedia[] {
  return (media ?? []).map((m) => ({
    id: m.id,
    kind: m.kind,
    placeholderHue: hueFromId(m.id),
    alt: m.alt || 'Property photo',
    caption: m.caption ?? undefined,
  }));
}

function toPublicListing(row: PublicListingRow, now: Date): PublicListing {
  // When the lister declared "no additional fees", the optional lines are not
  // applicable at all; otherwise a missing amount means "not stated".
  const noneKnown = row.fees_disclosure_state === 'none_known';
  const optional = (value: number | null) => (noneKnown ? undefined : value);

  const fees = buildFeeSummary({
    rentMinor: Number(row.rent_amount_minor),
    rentFrequency: row.rent_frequency,
    disclosure: row.fees_disclosure_state,
    agencyMinor: optional(row.agency_fee_minor),
    legalMinor: optional(row.legal_fee_minor),
    cautionMinor: optional(row.caution_fee_minor),
    serviceMinor: optional(row.service_charge_minor),
    otherMinor: optional(row.other_fee_minor),
    otherLabel: row.other_fee_label ?? undefined,
  });

  const lastConfirmedAt = row.last_confirmed_at ? new Date(row.last_confirmed_at) : new Date(0);

  return {
    id: row.id,
    slug: row.slug,
    referenceCode: row.reference_code,
    title: row.title,
    description: row.description,

    availabilityState: row.availability_state,
    freshness: buildFreshness(lastConfirmedAt, now),

    area: { name: row.area_name, slug: row.area_slug },
    publicLandmark: row.public_landmark ?? '',
    approxLocationLabel: row.approx_location_label ?? '',

    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    toilets: row.toilets,
    parkingSpaces: row.parking_spaces,
    furnishingState: row.furnishing_state,
    waterSource: row.water_source,
    electricityMeter: row.electricity_meter,
    features: row.features ?? [],
    houseRules: row.house_rules ?? [],

    fees,
    availableFromISO: row.available_from,

    media: mapMedia(row.media),
    lister: {
      slug: row.lister_slug,
      displayName: row.lister_display_name,
      listerType: row.lister_type,
      badges: row.lister_badges ?? [],
    },
    // Aggregate view/inquiry metrics arrive with Milestone 4.
    metrics: { qualifiedViews7d: 0, inquiries7d: 0 },
    sponsorship: row.sponsorship_label ? { label: row.sponsorship_label } : null,
  };
}

async function fetchRows(params: SearchParams): Promise<PublicListingRow[]> {
  let query = createAnonClient().from('public_listings').select('*');

  if (params.area) query = query.eq('area_slug', params.area);
  if (params.type) query = query.eq('property_type', params.type);
  if (params.beds !== undefined) query = query.gte('bedrooms', params.beds);
  if (params.furnished) query = query.eq('furnishing_state', 'furnished');
  if (params.directLandlord) query = query.eq('lister_type', 'landlord');
  if (params.minRent !== undefined) query = query.gte('rent_amount_minor', params.minRent * 100);
  if (params.maxRent !== undefined) query = query.lte('rent_amount_minor', params.maxRent * 100);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load listings: ${error.message}`);
  return (data ?? []) as PublicListingRow[];
}

async function searchableListings(params: SearchParams, now: Date): Promise<PublicListing[]> {
  const rows = await fetchRows(params);
  return rows
    .map((row) => toPublicListing(row, now))
    .filter((l) => isPubliclySearchable(l.availabilityState, l.freshness.status));
}

export const supabaseListingRepository: ListingRepository = {
  name: 'supabase',

  async searchAvailable(params, now) {
    const listings = await searchableListings(params, now);
    return sortListings(applyFilters(listings, params), params.sort ?? 'relevance');
  },

  async getBySlug(slug, now) {
    const { data, error } = await createAnonClient()
      .from('public_listings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle<PublicListingRow>();

    if (error) throw new Error(`Failed to load listing: ${error.message}`);
    return data ? toPublicListing(data, now) : null;
  },

  async getSimilar(listing, now, limit = 3) {
    const listings = await searchableListings({}, now);
    return pickSimilar(sortListings(listings, 'relevance'), listing, limit);
  },

  async getFeatured(now, limit = 6) {
    const listings = await searchableListings({}, now);
    return sortListings(listings, 'relevance').slice(0, limit);
  },

  async countAvailable(now) {
    return (await searchableListings({}, now)).length;
  },
};
