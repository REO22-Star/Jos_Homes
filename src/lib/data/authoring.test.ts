import { afterEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { WorkflowError } from '@/lib/domain/workflow';
import { toPublicListing } from '@/lib/domain/projection';
import { __resetAuthoringDB, approvedRecords } from './authoring-store';
import { __resetMediaStore } from '@/lib/media/storage';
import {
  addMedia,
  createDraft,
  getMine,
  listReviewQueue,
  moderate,
  submitForReview,
  updateDraft,
  type UploadFile,
} from './authoring';

const image = (name: string): UploadFile => ({
  fileName: name,
  mimeType: 'image/jpeg',
  bytes: new Uint8Array(1024),
});

const now = new Date('2026-07-19T12:00:00.000Z');

const user = (id: string, role: AuthUser['role']): AuthUser => ({
  id,
  email: `${role}@example.test`,
  displayName: `${role} user`,
  role,
  accountStatus: 'active',
});

const GRACE = 'a0000000-0000-4000-8000-000000000001';
const DANIEL = 'a0000000-0000-4000-8000-000000000002';
const grace = user(GRACE, 'lister');
const daniel = user(DANIEL, 'lister');
const seeker = user('seeker-x', 'seeker');
const mod = user('mod-x', 'moderator');
const admin = user('admin-x', 'admin');

const complete = {
  title: 'Bright 2 bedroom flat in Rayfield',
  description: 'A well-kept flat with steady water and prepaid metering, tiled throughout.',
  areaSlug: 'rayfield',
  propertyType: 'two_bedroom' as const,
  privateAddressLine: '12 Secret Close, Rayfield GRA',
  rentNaira: 850_000,
  rentFrequency: 'annual' as const,
  feeDisclosure: 'fees_listed' as const,
  availableFrom: '2026-08-01',
  contactPhone: '+2348000000001',
  authorizedToAdvertise: true,
};

afterEach(() => {
  __resetAuthoringDB();
  __resetMediaStore();
});

function newComplete(author = grace) {
  const result = createDraft(author, complete, now);
  if (!result.ok) throw new Error('draft creation should succeed');
  // Three images are required before a listing can be submitted.
  addMedia(author, result.record.id, [image('a.jpg'), image('b.jpg'), image('c.jpg')], now);
  return result.record.id;
}

describe('createDraft', () => {
  it('lets a lister create a draft but rejects a seeker', () => {
    expect(createDraft(grace, complete, now).ok).toBe(true);
    expect(() => createDraft(seeker, complete, now)).toThrow(AuthorizationError);
  });
});

describe('the submission → moderation → publish path', () => {
  it('submits a complete draft and a moderator approves it, making it public', () => {
    const id = newComplete();
    expect(submitForReview(grace, id, now)?.ok).toBe(true);
    expect(getMine(grace, id)?.workflowState).toBe('submitted');

    const decision = moderate(mod, id, 'approve', now);
    expect(decision && decision.ok).toBe(true);

    const approved = approvedRecords().find((r) => r.id === id);
    expect(approved?.workflowState).toBe('approved');

    // Public projection never leaks the private address (A5).
    const pub = toPublicListing(approved!, now);
    expect(JSON.stringify(pub)).not.toContain('Secret Close');
  });

  it('records status history for each transition (D4)', () => {
    const id = newComplete();
    submitForReview(grace, id, now);
    moderate(mod, id, 'approve', now);
    const changes = getMine(admin, id)!.statusHistory.map((h) => h.changeType);
    expect(changes).toEqual(['created', 'submitted', 'approve']);
  });
});

describe('acceptance guards', () => {
  it('rejects submitting an incomplete draft with field errors (D2)', () => {
    const draft = createDraft(grace, { title: 'Just a title' }, now);
    if (!draft.ok) throw new Error('draft should save');
    const submitted = submitForReview(grace, draft.record.id, now);
    expect(submitted?.ok).toBe(false);
    if (submitted && !submitted.ok) {
      expect(Object.keys(submitted.errors).length).toBeGreaterThan(0);
    }
  });

  it('a lister cannot approve their own listing (C2)', () => {
    const id = newComplete();
    submitForReview(grace, id, now);
    expect(() => moderate(grace, id, 'approve', now)).toThrow(AuthorizationError);
  });

  it('rejects an invalid transition: draft straight to approved (D3)', () => {
    const id = newComplete(); // still a draft
    // A moderator is permitted to approve, but the workflow forbids the jump.
    expect(() => moderate(mod, id, 'approve', now)).toThrow(WorkflowError);
  });

  it('a lister cannot edit another lister’s draft (C1)', () => {
    const id = newComplete(grace);
    expect(() => updateDraft(daniel, id, { title: 'Hijacked' }, now)).toThrow(AuthorizationError);
  });

  it('a lister cannot edit a listing once it is approved', () => {
    const id = newComplete();
    submitForReview(grace, id, now);
    moderate(mod, id, 'approve', now);
    expect(() => updateDraft(grace, id, { title: 'Late edit' }, now)).toThrow(AuthorizationError);
  });

  it('request_changes requires a reason and returns the listing to the lister', () => {
    const id = newComplete();
    submitForReview(grace, id, now);
    const noReason = moderate(mod, id, 'request_changes', now);
    expect(noReason && noReason.ok).toBe(false);
    const withReason = moderate(
      mod,
      id,
      'request_changes',
      now,
      'Add more photos and confirm the rent.',
    );
    expect(withReason && withReason.ok).toBe(true);
    expect(getMine(grace, id)?.workflowState).toBe('changes_requested');
  });

  it('only staff can read the review queue', () => {
    expect(() => listReviewQueue(grace)).toThrow(AuthorizationError);
    expect(Array.isArray(listReviewQueue(mod))).toBe(true);
  });
});
