import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { __resetAuthoringDB, getRecord } from './authoring-store';
import { __resetMediaStore } from '@/lib/media/storage';
import { addMedia, createDraft, moderate, submitForReview, type UploadFile } from './authoring';
import { __resetReportsDB } from './reports-store';
import { createReport, getReportForStaff, listReportsForStaff, resolveReport } from './reports';

const now = new Date('2026-07-23T12:00:00.000Z');

const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: `${role}@example.test`,
  displayName: role,
  role,
  accountStatus: 'active',
});
const GRACE = 'a0000000-0000-4000-8000-000000000001';
const grace = user(GRACE, 'lister');
const mod = user('mod-x', 'moderator');
const seeker = user('seeker-x', 'seeker');

const img = (n: string): UploadFile => ({
  fileName: n,
  mimeType: 'image/jpeg',
  bytes: new Uint8Array(1024),
});
const complete = {
  title: 'Bright 2 bedroom flat in Rayfield',
  description: 'A well-kept flat with steady water and prepaid metering, tiled throughout.',
  areaSlug: 'rayfield',
  propertyType: 'two_bedroom' as const,
  privateAddressLine: '12 Secret Close, Rayfield',
  rentNaira: 850_000,
  rentFrequency: 'annual' as const,
  feeDisclosure: 'none_known' as const,
  availableFrom: '2026-08-01',
  contactPhone: '+2348000000001',
  authorizedToAdvertise: true,
};

afterEach(() => {
  __resetReportsDB();
  __resetAuthoringDB();
  __resetMediaStore();
});

function approvedListingId() {
  const d = createDraft(grace, complete, now);
  if (!d.ok) throw new Error('draft');
  addMedia(grace, d.record.id, [img('a.jpg'), img('b.jpg'), img('c.jpg')], now);
  submitForReview(grace, d.record.id, now);
  moderate(mod, d.record.id, 'approve', now);
  return d.record.id;
}

describe('createReport', () => {
  it('accepts a valid reason and rejects an invalid one', () => {
    expect(
      createReport(
        {
          listingId: 'l1',
          listingTitle: 'X',
          reportedListerId: null,
          reporterVisitorId: 'v1',
          reasonCode: 'Duplicate listing',
        },
        now,
      ).ok,
    ).toBe(true);
    expect(
      createReport(
        {
          listingId: 'l1',
          listingTitle: 'X',
          reportedListerId: null,
          reporterVisitorId: 'v1',
          reasonCode: 'nonsense',
        },
        now,
      ).ok,
    ).toBe(false);
  });

  it('does not change the reported listing (E5)', () => {
    const id = approvedListingId();
    createReport(
      {
        listingId: id,
        listingTitle: 'X',
        reportedListerId: GRACE,
        reporterVisitorId: 'v1',
        reasonCode: 'Property appears taken',
      },
      now,
    );
    // The listing is untouched by the report itself.
    expect(getRecord(id)?.availabilityState).toBe('available');
    expect(getRecord(id)?.workflowState).toBe('approved');
  });
});

describe('reports are staff-only (I1)', () => {
  it('an ordinary lister/seeker cannot list or read reports', () => {
    expect(() => listReportsForStaff(grace)).toThrow(AuthorizationError);
    expect(() => getReportForStaff(seeker, 'rep-1')).toThrow(AuthorizationError);
    expect(Array.isArray(listReportsForStaff(mod))).toBe(true);
  });
});

describe('resolveReport (deliberate staff action, E5)', () => {
  it('placing a report under review changes the listing only on the deliberate action', () => {
    const id = approvedListingId();
    const created = createReport(
      {
        listingId: id,
        listingTitle: 'X',
        reportedListerId: GRACE,
        reporterVisitorId: 'v1',
        reasonCode: 'Suspicious or fraudulent behavior',
      },
      now,
    );
    if (!created.ok) throw new Error('report');
    expect(getRecord(id)?.availabilityState).toBe('available'); // still unchanged

    const res = resolveReport(mod, created.report.id, 'placed_under_review', now);
    expect(res && res.ok).toBe(true);
    expect(getRecord(id)?.availabilityState).toBe('under_review');
  });

  it('rejects resolution by a non-staff user', () => {
    const created = createReport(
      {
        listingId: 'l1',
        listingTitle: 'X',
        reportedListerId: null,
        reporterVisitorId: 'v1',
        reasonCode: 'Other',
      },
      now,
    );
    if (!created.ok) throw new Error('report');
    expect(() => resolveReport(grace, created.report.id, 'dismissed_no_issue', now)).toThrow(
      AuthorizationError,
    );
  });
});
