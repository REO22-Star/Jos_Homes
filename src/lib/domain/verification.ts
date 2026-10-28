import type { VerificationType } from './types';

/**
 * Pure verification-badge validity (docs/PRODUCT_REQUIREMENTS.md §20).
 *
 * A badge is public ONLY when it is active, not revoked, and not expired
 * (acceptance I3). A "pending" record — e.g. a paid check awaiting review —
 * is never valid, so paying for a service cannot force a positive badge (I4).
 */
export interface BadgeValidityInput {
  status: 'pending' | 'active' | 'revoked';
  expiresAtISO: string | null;
  revokedAtISO: string | null;
}

export function isBadgeValid(v: BadgeValidityInput, now: Date): boolean {
  if (v.status !== 'active') return false;
  if (v.revokedAtISO) return false;
  if (v.expiresAtISO && new Date(v.expiresAtISO).getTime() <= now.getTime()) return false;
  return true;
}

/** The set of verification types a check subject may hold (for admin UIs). */
export const ISSUABLE_VERIFICATIONS: VerificationType[] = [
  'phone',
  'identity_review',
  'business_review',
  'professional_registration_review',
  'property_access',
  'landlord_authorization',
  'platform_inspection',
];
