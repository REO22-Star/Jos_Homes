import { DEFAULT_FRESHNESS_CONFIG, type FreshnessConfig } from './config';
import { buildFeeSummary } from './fees';
import { buildFreshness } from './freshness';
import type { InternalListing, InternalVerification } from './internal-types';
import type { PublicListing, PublicMedia, VerificationType } from './types';

/**
 * A verification badge is public only when it is active, not revoked, and not
 * expired relative to `now` (docs/ACCEPTANCE_TESTS.md I3).
 */
function validBadges(verifications: InternalVerification[], now: Date): VerificationType[] {
  return verifications
    .filter((v) => {
      if (v.status !== 'active') return false;
      if (v.revokedAtISO) return false;
      if (v.expiresAtISO && new Date(v.expiresAtISO).getTime() <= now.getTime()) return false;
      return true;
    })
    .map((v) => v.type);
}

/**
 * Project an internal listing record to the safe public shape.
 *
 * This is the single enforced privacy boundary: the returned object contains no
 * private address, no verification evidence path, no raw phone, no workflow
 * state, and no unapproved media (docs/DATA_MODEL.md "Public projection",
 * docs/ACCEPTANCE_TESTS.md A5, B3, H4).
 */
export function toPublicListing(
  listing: InternalListing,
  now: Date,
  config: FreshnessConfig = DEFAULT_FRESHNESS_CONFIG,
): PublicListing {
  const { property, lister } = listing;

  const media: PublicMedia[] = listing.media
    .filter((m) => m.moderationState === 'approved')
    .map((m) => ({
      id: m.id,
      kind: m.kind,
      placeholderHue: m.placeholderHue,
      alt: m.alt,
      caption: m.caption,
      // Approved uploaded images get a public URL. Seed media may point at a
      // labelled stock photo instead; otherwise it has no URL (a sketch is shown).
      url: m.objectId ? `/api/media/${m.objectId}` : m.sampleSrc,
      isSample: !m.objectId && Boolean(m.sampleSrc),
      posterUrl: m.posterObjectId ? `/api/media/${m.posterObjectId}` : undefined,
    }));

  const fees = buildFeeSummary({
    rentMinor: listing.rentMinor,
    rentFrequency: listing.rentFrequency,
    disclosure: listing.feeDisclosure,
    agencyMinor: listing.agencyMinor,
    legalMinor: listing.legalMinor,
    cautionMinor: listing.cautionMinor,
    serviceMinor: listing.serviceMinor,
    otherMinor: listing.otherMinor,
    otherLabel: listing.otherLabel,
  });

  return {
    id: listing.id,
    slug: listing.slug,
    referenceCode: listing.referenceCode,
    title: listing.title,
    description: listing.description,

    availabilityState: listing.availabilityState,
    freshness: buildFreshness(listing.lastConfirmedAt, now, config),

    area: { name: property.areaName, slug: property.areaSlug },
    publicLandmark: property.publicLandmark,
    approxLocationLabel: property.approxLocationLabel,

    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    toilets: property.toilets,
    parkingSpaces: property.parkingSpaces,
    furnishingState: property.furnishingState,
    waterSource: property.waterSource,
    electricityMeter: property.electricityMeter,
    features: property.features,
    houseRules: property.houseRules,

    fees,
    availableFromISO: listing.availableFromISO,

    media,
    lister: {
      slug: lister.slug,
      displayName: lister.displayName,
      listerType: lister.listerType,
      badges: validBadges(lister.verifications, now),
    },
    metrics: {
      qualifiedViews7d: listing.qualifiedViews7d,
      inquiries7d: listing.inquiries7d,
    },
    sponsorship: listing.sponsorshipLabel ? { label: listing.sponsorshipLabel } : null,
  };
}
