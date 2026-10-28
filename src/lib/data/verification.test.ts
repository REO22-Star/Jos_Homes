import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { __resetVerificationDB } from './verification-store';
import {
  issueVerification,
  listVerificationsForAdmin,
  revokeVerification,
  validBadgesForProfile,
} from './verification';

const now = new Date('2026-07-23T12:00:00.000Z');
const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: `${role}@example.test`,
  displayName: role,
  role,
  accountStatus: 'active',
});
const admin = user('admin-x', 'admin');
const mod = user('mod-x', 'moderator');
const SUBJECT = 'lister-under-test';

afterEach(() => __resetVerificationDB());

describe('verification is admin-only (I4)', () => {
  it('only an administrator can issue a verification', () => {
    expect(() => issueVerification(mod, SUBJECT, 'identity_review', 'Docs reviewed', now)).toThrow(
      AuthorizationError,
    );
    const record = issueVerification(admin, SUBJECT, 'identity_review', 'Docs reviewed', now);
    expect(record.status).toBe('active');
    // A record is only ever created active by an admin review — never by payment.
  });
});

describe('valid public badges (I2/I3)', () => {
  it('reflects issued badges and drops revoked ones', () => {
    const record = issueVerification(admin, SUBJECT, 'property_access', 'Visited', now);
    expect(validBadgesForProfile(SUBJECT, now)).toContain('property_access');

    revokeVerification(admin, record.id, now);
    expect(validBadgesForProfile(SUBJECT, now)).not.toContain('property_access');
  });

  it('never exposes evidence through the public badge list', () => {
    issueVerification(admin, SUBJECT, 'business_review', 'Company registration seen', now);
    // The public helper returns only types — no evidence paths or summaries.
    expect(validBadgesForProfile(SUBJECT, now)).toEqual(['business_review']);
  });
});

describe('evidence access (J3)', () => {
  it('a moderator cannot list verification records (evidence summaries)', () => {
    expect(() => listVerificationsForAdmin(mod, SUBJECT)).toThrow(AuthorizationError);
    expect(Array.isArray(listVerificationsForAdmin(admin, SUBJECT))).toBe(true);
  });
});
