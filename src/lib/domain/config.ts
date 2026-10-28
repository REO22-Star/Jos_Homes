/**
 * Product configuration. In production these live in the `platform_settings`
 * table and are editable by admins (docs/DATA_MODEL.md #20). For Milestone 0
 * they are centralised here so no numeric policy is scattered through the UI.
 */

export interface FreshnessConfig {
  /** Confirmed within this many hours -> "fresh". */
  freshHours: number;
  /** Confirmed within this many days -> "recent". */
  recentDays: number;
  /** Not confirmed after this many days -> "confirmation overdue". */
  overdueDays: number;
  /** Suppressed from ordinary search after this many days without confirmation. */
  suppressDays: number;
}

export const DEFAULT_FRESHNESS_CONFIG: FreshnessConfig = {
  freshHours: 72,
  recentDays: 7,
  overdueDays: 7,
  suppressDays: 14,
};

export interface ViewConfig {
  dedupeHours: number;
  minEngagementSeconds: number;
}

export const DEFAULT_VIEW_CONFIG: ViewConfig = {
  dedupeHours: 24,
  minEngagementSeconds: 5,
};

/** Availability states that appear in ordinary public "available" search. */
export const SEARCHABLE_AVAILABILITY_STATES = [
  'available',
  'inspection_ongoing',
  'application_pending',
] as const;

export interface MediaConfig {
  allowedImageMimeTypes: readonly string[];
  maxImageBytes: number;
  maxImagesPerListing: number;
  /** Minimum approved-or-pending images required to submit for review (OQ-004). */
  minImagesForSubmission: number;
}

export const DEFAULT_MEDIA_CONFIG: MediaConfig = {
  allowedImageMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageBytes: 5 * 1024 * 1024, // 5 MB
  maxImagesPerListing: 12,
  minImagesForSubmission: 3,
};
