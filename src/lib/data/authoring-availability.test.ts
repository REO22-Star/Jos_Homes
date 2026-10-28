import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { isPubliclySearchable } from '@/lib/domain/availability';
import { __resetAuthoringDB } from './authoring-store';
import { __resetMediaStore } from '@/lib/media/storage';
import {
  addMedia,
  createDraft,
  moderate,
  reconfirmAvailability,
  setAvailability,
  submitForReview,
  type UploadFile,
} from './authoring';

const now = new Date('2026-07-21T12:00:00.000Z');
const later = new Date('2026-07-25T12:00:00.000Z');

const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: 'x@example.test',
  displayName: 'x',
  role,
  accountStatus: 'active',
});
const GRACE = 'a0000000-0000-4000-8000-000000000001';
const grace = user(GRACE, 'lister');
const daniel = user('daniel-x', 'lister');
const mod = user('mod-x', 'moderator');

const image = (n: string): UploadFile => ({
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
  __resetAuthoringDB();
  __resetMediaStore();
});

function approvedListing() {
  const draft = createDraft(grace, complete, now);
  if (!draft.ok) throw new Error('draft');
  const id = draft.record.id;
  addMedia(grace, id, [image('a.jpg'), image('b.jpg'), image('c.jpg')], now);
  submitForReview(grace, id, now);
  moderate(mod, id, 'approve', now);
  return id;
}

describe('availability (Milestone 4)', () => {
  it('reconfirmation resets the freshness clock; only the owner may (E1/E2)', () => {
    const id = approvedListing();
    const res = reconfirmAvailability(grace, id, later);
    if (!res || !res.ok) throw new Error('reconfirm');
    expect(res.record.lastConfirmedAt.getTime()).toBe(later.getTime());
    expect(() => reconfirmAvailability(daniel, id, later)).toThrow(AuthorizationError);
  });

  it('marking a listing taken removes it from ordinary search (E4)', () => {
    const id = approvedListing();
    const res = setAvailability(grace, id, 'taken', later);
    if (!res || !res.ok) throw new Error('set taken');
    expect(res.record.availabilityState).toBe('taken');
    expect(isPubliclySearchable('taken', 'fresh')).toBe(false);
  });

  it('rejects an invalid availability target and blocks another lister (E2)', () => {
    const id = approvedListing();
    const bad = setAvailability(grace, id, 'under_review' as never, later);
    expect(bad && bad.ok).toBe(false);
    expect(() => setAvailability(daniel, id, 'taken', later)).toThrow(AuthorizationError);
  });
});
