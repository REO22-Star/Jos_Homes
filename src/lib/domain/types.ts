/**
 * Domain types for JosHomes.
 *
 * A physical `property` and a vacancy `listing` are separate records
 * (docs/DATA_MODEL.md). Public pages must only ever consume `PublicListing`,
 * which is produced by the projection in `projection.ts` and never contains
 * a private address, verification evidence, internal notes, or raw contact data.
 */

// --- Enums (mirror docs/DATA_MODEL.md) ---

export type ListingWorkflowState =
  'draft' | 'submitted' | 'changes_requested' | 'approved' | 'rejected' | 'suspended' | 'archived';

export type AvailabilityState =
  | 'available'
  | 'inspection_ongoing'
  | 'application_pending'
  | 'taken'
  | 'paused'
  | 'confirmation_overdue'
  | 'under_review';

export type ListerType = 'landlord' | 'agent' | 'caretaker' | 'firm' | 'platform_in_house';

export type PropertyType =
  'self_contained' | 'mini_flat' | 'one_bedroom' | 'two_bedroom' | 'three_bedroom' | 'duplex';

export type FurnishingState = 'unfurnished' | 'semi_furnished' | 'furnished';

export type RentFrequency = 'annual' | 'monthly';

/** Explicit intent signals. Opening a listing is NOT an inquiry (docs §16.2). */
export type InquiryType = 'call_click' | 'whatsapp_click' | 'inspection_request' | 'interest_form';

/** Precise verification badge labels. A badge states what was checked, never a guarantee. */
export type VerificationType =
  | 'phone'
  | 'identity_review'
  | 'business_review'
  | 'professional_registration_review'
  | 'property_access'
  | 'landlord_authorization'
  | 'platform_inspection';

/** Explicit disclosure state for additional charges. Never conflate unknown with zero. */
export type FeeDisclosureState = 'none_known' | 'fees_listed' | 'not_stated';

// --- Money ---

/**
 * All money is stored as an integer number of minor units (kobo; 100 kobo = NGN 1).
 * Never use floating-point arithmetic for totals.
 */
export type MinorAmount = number;

// --- Media (Milestone 0 uses safe generated placeholders, never real photos) ---

export type MediaKind = 'image' | 'video';

export interface PublicMedia {
  id: string;
  kind: MediaKind;
  /** Deterministic hue (0-360) used to render a safe CSS placeholder tile. */
  placeholderHue: number;
  alt: string;
  caption?: string;
  /** Public URL of an uploaded, approved image, or of a sample stock photo. */
  url?: string;
  /** True when `url` is a stock stand-in, not a photo of this property. */
  isSample?: boolean;
  /** Poster image URL for video (video never autoplays). */
  posterUrl?: string;
}

// --- Lister (public projection only) ---

export interface PublicLister {
  slug: string;
  displayName: string;
  listerType: ListerType;
  /** Valid, non-expired, non-revoked badges only. */
  badges: VerificationType[];
}

// --- Area ---

export interface Area {
  name: string;
  slug: string;
}

// --- Fees ---

export interface FeeLine {
  key: 'rent' | 'agency' | 'legal' | 'caution' | 'service' | 'other';
  label: string;
  /** null means "not stated" (unknown) — rendered differently from a real zero. */
  amountMinor: MinorAmount | null;
  /** Whether this line is part of the estimated move-in total. */
  includedInTotal: boolean;
}

export interface FeeSummary {
  rentFrequency: RentFrequency;
  disclosure: FeeDisclosureState;
  lines: FeeLine[];
  /** Sum of all known, includable minor amounts. */
  estimatedMoveInTotalMinor: MinorAmount;
}

// --- Freshness (computed, see freshness.ts) ---

export type FreshnessStatus = 'fresh' | 'recent' | 'overdue' | 'suppressed';

export interface Freshness {
  status: FreshnessStatus;
  /** Human label such as "Confirmed today" or "Last confirmed 3 days ago". */
  label: string;
  /** ISO timestamp availability was last confirmed. */
  lastConfirmedAtISO: string;
}

// --- Aggregate metrics (public shows counts only, never identities) ---

export interface PublicMetrics {
  qualifiedViews7d: number;
  inquiries7d: number;
}

// --- Public listing (the only shape public pages may consume) ---

export interface PublicListing {
  id: string;
  slug: string;
  referenceCode: string;
  title: string;
  description: string;

  availabilityState: AvailabilityState;
  freshness: Freshness;

  area: Area;
  /** Public landmark only. Never the private street address. */
  publicLandmark: string;
  /** Human description of approximate location; no exact pin. */
  approxLocationLabel: string;

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

  fees: FeeSummary;
  availableFromISO: string | null;

  media: PublicMedia[];
  lister: PublicLister;
  metrics: PublicMetrics;

  /** Present only for paid placement; must be visibly labelled. */
  sponsorship: { label: string } | null;
}
