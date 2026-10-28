import { DEFAULT_VIEW_CONFIG, type ViewConfig } from './config';

/**
 * Pure qualified-view rules (docs/PRODUCT_REQUIREMENTS.md §16.1).
 *
 * A "qualified view" is a deduplicated, non-bot property-page visit that meets a
 * minimum engagement threshold and is not the listing owner or platform staff.
 * Deduplication (same visitor once per window) is enforced by the store; this
 * module decides whether a single visit is eligible at all (F2/F4).
 */

export interface ViewQualificationInput {
  /** The visit is by the listing's owner/assigned lister. */
  isOwner: boolean;
  /** The visit is by a moderator/administrator. */
  isStaff: boolean;
  /** The visit looks like a bot or automated test. */
  isBot: boolean;
  /** Seconds the page was engaged/visible before the beacon fired. */
  engagementSeconds: number;
}

export type ViewQualification =
  { qualified: true } | { qualified: false; reason: 'bot' | 'owner' | 'staff' | 'engagement' };

export function qualifiesAsView(
  input: ViewQualificationInput,
  config: ViewConfig = DEFAULT_VIEW_CONFIG,
): ViewQualification {
  if (input.isBot) return { qualified: false, reason: 'bot' };
  if (input.isOwner) return { qualified: false, reason: 'owner' };
  if (input.isStaff) return { qualified: false, reason: 'staff' };
  if (input.engagementSeconds < config.minEngagementSeconds) {
    return { qualified: false, reason: 'engagement' };
  }
  return { qualified: true };
}

/** A conservative bot check on a user-agent string. */
export function looksLikeBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true; // no UA at all -> treat as non-human
  return /bot|crawler|spider|crawling|headless|playwright|puppeteer|lighthouse/i.test(userAgent);
}
