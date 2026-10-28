import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import type { VerificationType } from '@/lib/domain/types';
import { isBadgeValid } from '@/lib/domain/verification';
import { appendAudit } from './authoring-store';
import {
  getVerification,
  listForSubject,
  pushVerification,
  type VerificationRecord,
} from './verification-store';

/**
 * Verification service. Issuing and revoking are administrator-only actions
 * (I4 — a paid service can never set its own positive badge; it takes an admin
 * review action). Public badges are derived only from valid records (I2/I3).
 */

function assertAdmin(user: AuthUser): void {
  if (user.role !== 'admin') throw new AuthorizationError();
}

export function issueVerification(
  user: AuthUser,
  subjectId: string,
  type: VerificationType,
  evidenceSummary: string,
  now: Date,
): VerificationRecord {
  assertAdmin(user);
  const record = pushVerification(
    {
      subjectId,
      type,
      status: 'active',
      // Evidence lives behind a private pointer, never in a public projection.
      evidencePath: `private/evidence/${subjectId}/${type}`,
      evidenceSummary: evidenceSummary.trim() || null,
      reviewedBy: user.id,
      issuedAtISO: now.toISOString(),
      expiresAtISO: null,
      revokedAtISO: null,
    },
    now.getTime(),
  );
  appendAudit(
    {
      actorId: user.id,
      action: 'verification.issue',
      targetType: 'profile',
      targetId: subjectId,
      summary: type,
    },
    now.toISOString(),
  );
  return record;
}

export function revokeVerification(
  user: AuthUser,
  recordId: string,
  now: Date,
): { ok: true } | { ok: false; error: string } | null {
  assertAdmin(user);
  const record = getVerification(recordId);
  if (!record) return null;
  record.status = 'revoked';
  record.revokedAtISO = now.toISOString();
  appendAudit(
    {
      actorId: user.id,
      action: 'verification.revoke',
      targetType: 'profile',
      targetId: record.subjectId,
      summary: record.type,
    },
    now.toISOString(),
  );
  return { ok: true };
}

/** Valid public badges for a lister profile (active, non-revoked, non-expired). */
export function validBadgesForProfile(subjectId: string, now: Date): VerificationType[] {
  return listForSubject(subjectId)
    .filter((r) =>
      isBadgeValid(
        { status: r.status, expiresAtISO: r.expiresAtISO, revokedAtISO: r.revokedAtISO },
        now,
      ),
    )
    .map((r) => r.type);
}

/** All records for a subject — admin only (includes evidence summary). */
export function listVerificationsForAdmin(user: AuthUser, subjectId: string): VerificationRecord[] {
  assertAdmin(user);
  return listForSubject(subjectId);
}
