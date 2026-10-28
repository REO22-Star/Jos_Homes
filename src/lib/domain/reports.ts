/**
 * Report reasons and resolutions (docs/CONTENT_AND_COPY.md "Report flow").
 * Pure constants + validation so the report workflow stays testable and the
 * reporter's identity is never part of what is validated or displayed (I1).
 */

export const REPORT_REASONS = [
  'Property appears taken',
  'Price or fees are different',
  'Images do not match',
  'Wrong location',
  'Suspicious or fraudulent behavior',
  'Duplicate listing',
  'Unsafe or inappropriate content',
  'Other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export function isValidReportReason(value: string): value is ReportReason {
  return (REPORT_REASONS as readonly string[]).includes(value);
}

export type ReportStatus = 'new' | 'reviewing' | 'resolved' | 'dismissed';

/** How a moderator can resolve a report. A report never auto-deletes (E5). */
export const REPORT_RESOLUTIONS = [
  'dismissed_no_issue',
  'placed_under_review',
  'listing_suspended',
  'lister_warned',
  'lister_suspended',
] as const;

export type ReportResolution = (typeof REPORT_RESOLUTIONS)[number];

export function isValidResolution(value: string): value is ReportResolution {
  return (REPORT_RESOLUTIONS as readonly string[]).includes(value);
}
