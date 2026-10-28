import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { toPublicListing } from '@/lib/domain/projection';
import { __resetAuthoringDB } from './authoring-store';
import { __resetMediaStore, getPublicBlob } from '@/lib/media/storage';
import {
  addMedia,
  createDraft,
  moderate,
  moderateMedia,
  removeMedia,
  submitForReview,
  type UploadFile,
} from './authoring';

const now = new Date('2026-07-19T12:00:00.000Z');

const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: `${role}@example.test`,
  displayName: `${role} user`,
  role,
  accountStatus: 'active',
});
const GRACE = 'a0000000-0000-4000-8000-000000000001';
const grace = user(GRACE, 'lister');
const daniel = user('daniel-x', 'lister');
const mod = user('mod-x', 'moderator');

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const img = (name = 'room.jpg'): UploadFile => ({
  fileName: name,
  mimeType: MIME[name.split('.').pop() ?? 'jpg'] ?? 'image/jpeg',
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

function draftId() {
  const r = createDraft(grace, complete, now);
  if (!r.ok) throw new Error('draft');
  return r.record.id;
}

describe('media upload', () => {
  it('attaches valid images as pending; the owner only (H3)', () => {
    const id = draftId();
    const res = addMedia(grace, id, [img(), img('kitchen.png')], now);
    expect(res && res.ok && res.added).toBe(2);
    expect(() => addMedia(daniel, id, [img()], now)).toThrow(AuthorizationError);
  });

  it('rejects a bad file with a message but keeps the good ones (H1/H2)', () => {
    const id = draftId();
    const bad: UploadFile = {
      fileName: 'note.txt',
      mimeType: 'text/plain',
      bytes: new Uint8Array(10),
    };
    const res = addMedia(grace, id, [img(), bad], now);
    if (!res || !res.ok) throw new Error('expected ok');
    expect(res.added).toBe(1);
    expect(res.errors.join(' ')).toMatch(/not supported/i);
  });
});

describe('media moderation and publication (B3)', () => {
  it('shows only approved media publicly', () => {
    const id = draftId();
    addMedia(grace, id, [img(), img('b.jpg'), img('c.jpg')], now);
    // Submit + approve the listing so it can be projected publicly.
    submitForReview(grace, id, now);
    const listing = moderateApproveListing(id);

    // With media still pending, the public projection exposes no images.
    expect(toPublicListing(listing, now).media).toHaveLength(0);

    // Approve one image; now exactly that one is public.
    const firstMediaId = listing.media[0]!.id;
    const after = moderateMedia(mod, id, firstMediaId, 'approve', now);
    if (!after || !after.ok) throw new Error('approve failed');
    expect(toPublicListing(after.record, now).media).toHaveLength(1);
    expect(toPublicListing(after.record, now).media[0]!.url).toMatch(/^\/api\/media\//);
  });

  it('requires at least three images to submit (OQ-004)', () => {
    const id = draftId();
    addMedia(grace, id, [img(), img('b.jpg')], now); // only two
    const tooFew = submitForReview(grace, id, now);
    expect(tooFew && tooFew.ok).toBe(false);
    addMedia(grace, id, [img('c.jpg')], now); // now three
    expect(submitForReview(grace, id, now)?.ok).toBe(true);
  });
});

describe('media removal', () => {
  it('removes an image and deletes its stored blob', () => {
    const id = draftId();
    const res = addMedia(grace, id, [img()], now);
    if (!res || !res.ok) throw new Error('add');
    const objectId = res.record.media[0]!.objectId!;
    expect(getPublicBlob(objectId)).toBeDefined();
    const mediaId = res.record.media[0]!.id;
    removeMedia(grace, id, mediaId, now);
    expect(getPublicBlob(objectId)).toBeUndefined();
  });
});

function moderateApproveListing(id: string) {
  const r = moderate(mod, id, 'approve', now);
  if (!r || !r.ok) throw new Error('listing approve failed');
  return r.record;
}
