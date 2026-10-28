import type {
  AvailabilityState,
  FurnishingState,
  ListerType,
  ListingWorkflowState,
  MediaKind,
  MinorAmount,
  PropertyType,
  RentFrequency,
  VerificationType,
  FeeDisclosureState,
} from './types';

/**
 * Internal records model what the database would hold, INCLUDING private fields.
 * These types must never be handed to a client component or serialized into a
 * public payload. Only `toPublicListing` (projection.ts) may read them, and it
 * returns a `PublicListing` that omits every private field.
 */

export interface InternalProperty {
  id: string;
  areaName: string;
  areaSlug: string;
  publicLandmark: string;
  approxLocationLabel: string;

  // --- PRIVATE: never projected to the public ---
  privateAddressLine: string;
  privateAddressNotes: string | null;

  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  parkingSpaces: number | null;
  furnishingState: FurnishingState;
  waterSource: string | null;
  electricityMeter: string | null;
  features: string[];
  houseRules: string[];
}

export interface InternalVerification {
  type: VerificationType;
  status: 'active' | 'pending' | 'revoked';
  /** ISO or null (no expiry). */
  expiresAtISO: string | null;
  revokedAtISO: string | null;
  /** PRIVATE: evidence pointer, never projected. */
  evidencePath: string | null;
}

export interface InternalLister {
  slug: string;
  displayName: string;
  listerType: ListerType;
  /** PRIVATE: raw contact number, never projected in Milestone 0. */
  privatePhoneE164: string;
  verifications: InternalVerification[];
}

export interface InternalMedia {
  id: string;
  kind: MediaKind;
  placeholderHue: number;
  alt: string;
  caption?: string;
  moderationState: 'pending' | 'approved' | 'rejected' | 'quarantined';
  /** Object id in the PUBLIC blob store for an uploaded image. */
  objectId?: string;
  /** Object id of a generated poster (video). */
  posterObjectId?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface InternalListing {
  id: string;
  slug: string;
  referenceCode: string;
  title: string;
  description: string;

  workflowState: ListingWorkflowState;
  availabilityState: AvailabilityState;

  rentMinor: MinorAmount;
  rentFrequency: RentFrequency;
  feeDisclosure: FeeDisclosureState;
  agencyMinor?: MinorAmount | null;
  legalMinor?: MinorAmount | null;
  cautionMinor?: MinorAmount | null;
  serviceMinor?: MinorAmount | null;
  otherMinor?: MinorAmount | null;
  otherLabel?: string;

  availableFromISO: string | null;
  /** Absolute time availability was last confirmed. */
  lastConfirmedAt: Date;

  property: InternalProperty;
  lister: InternalLister;
  media: InternalMedia[];

  qualifiedViews7d: number;
  inquiries7d: number;

  sponsorshipLabel: string | null;
}
