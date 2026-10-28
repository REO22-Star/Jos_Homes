import { describe, expect, it } from 'vitest';
import {
  AuthorizationError,
  GUEST,
  assertCan,
  can,
  isStaff,
  type Actor,
  type ListingResource,
} from './authorization';

const LISTER_A = 'lister-a';
const LISTER_B = 'lister-b';

const actor = (
  id: string | null,
  role: Actor['role'],
  status: Actor['accountStatus'] = 'active',
): Actor => ({
  id,
  role,
  accountStatus: status,
});

const listerA = actor(LISTER_A, 'lister');
const listerB = actor(LISTER_B, 'lister');
const seeker = actor('seeker-1', 'seeker');
const moderator = actor('mod-1', 'moderator');
const admin = actor('admin-1', 'admin');

const listingOfA = (
  workflowState: ListingResource['workflowState'] = 'draft',
): ListingResource => ({
  kind: 'listing',
  createdBy: LISTER_A,
  assignedListerId: LISTER_A,
  workflowState,
});

describe('guests and inactive accounts', () => {
  it('a guest can perform no privileged action', () => {
    expect(can(GUEST, 'edit', listingOfA())).toBe(false);
    expect(can(GUEST, 'approve', listingOfA('submitted'))).toBe(false);
    expect(can(GUEST, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
  });

  it('a suspended account cannot write even on its own listing', () => {
    const suspended = actor(LISTER_A, 'lister', 'suspended');
    expect(can(suspended, 'edit', listingOfA())).toBe(false);
    expect(can(suspended, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
  });
});

describe('C1 — a lister can only touch their own records', () => {
  it('lister A can edit their own editable listing', () => {
    expect(can(listerA, 'edit', listingOfA('draft'))).toBe(true);
    expect(can(listerA, 'edit', listingOfA('changes_requested'))).toBe(true);
  });

  it('lister B cannot edit lister A’s listing', () => {
    expect(can(listerB, 'edit', listingOfA('draft'))).toBe(false);
    expect(can(listerB, 'view_private', listingOfA('draft'))).toBe(false);
    expect(can(listerB, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
  });

  it('lister B cannot touch lister A’s property, media, or inquiries', () => {
    expect(
      can(listerB, 'edit', { kind: 'property', createdBy: LISTER_A, assignedListerId: LISTER_A }),
    ).toBe(false);
    expect(can(listerB, 'edit', { kind: 'media', listingListerId: LISTER_A })).toBe(false);
    expect(can(listerB, 'view_private', { kind: 'inquiry', assignedListerId: LISTER_A })).toBe(
      false,
    );
  });

  it('the assigned lister can read their own inquiries (G2)', () => {
    expect(can(listerA, 'view_private', { kind: 'inquiry', assignedListerId: LISTER_A })).toBe(
      true,
    );
  });

  it('a lister cannot edit their own listing once it is approved', () => {
    expect(can(listerA, 'edit', listingOfA('approved'))).toBe(false);
  });
});

describe('C2 — no self-approval', () => {
  it('a lister cannot approve or reject their own listing', () => {
    expect(can(listerA, 'approve', listingOfA('submitted'))).toBe(false);
    expect(can(listerA, 'reject', listingOfA('submitted'))).toBe(false);
  });

  it('a moderator can approve someone else’s listing', () => {
    expect(can(moderator, 'approve', listingOfA('submitted'))).toBe(true);
    expect(can(admin, 'approve', listingOfA('submitted'))).toBe(true);
  });

  it('even a moderator cannot approve a listing they own', () => {
    const ownedByModerator: ListingResource = {
      kind: 'listing',
      createdBy: moderator.id!,
      assignedListerId: moderator.id!,
      workflowState: 'submitted',
    };
    expect(can(moderator, 'approve', ownedByModerator)).toBe(false);
    expect(can(admin, 'approve', ownedByModerator)).toBe(true); // a different admin still can
  });

  it('a lister cannot approve their own media', () => {
    expect(can(listerA, 'moderate_media', { kind: 'media', listingListerId: LISTER_A })).toBe(
      false,
    );
    expect(can(moderator, 'moderate_media', { kind: 'media', listingListerId: LISTER_A })).toBe(
      true,
    );
  });

  it('a lister cannot request changes on their own listing; staff can', () => {
    expect(can(listerA, 'request_changes', listingOfA('submitted'))).toBe(false);
    expect(can(moderator, 'request_changes', listingOfA('submitted'))).toBe(true);
    expect(can(admin, 'request_changes', listingOfA('submitted'))).toBe(true);
  });
});

describe('archiving', () => {
  it('a lister may archive their own listing; another lister may not', () => {
    expect(can(listerA, 'archive', listingOfA('draft'))).toBe(true);
    expect(can(listerB, 'archive', listingOfA('draft'))).toBe(false);
    expect(can(admin, 'archive', listingOfA('draft'))).toBe(true);
  });
});

describe('C3 — role escalation is blocked', () => {
  it('no ordinary user can change any role', () => {
    for (const a of [seeker, listerA, moderator]) {
      expect(can(a, 'change_role', { kind: 'profile', profileId: 'someone-else' })).toBe(false);
    }
  });

  it('a user cannot change their own role', () => {
    expect(can(seeker, 'change_role', { kind: 'profile', profileId: seeker.id! })).toBe(false);
    expect(can(admin, 'change_role', { kind: 'profile', profileId: admin.id! })).toBe(false);
  });

  it('an admin can change another user’s role', () => {
    expect(can(admin, 'change_role', { kind: 'profile', profileId: 'someone-else' })).toBe(true);
  });
});

describe('J3 — moderator and administrator permissions are distinct', () => {
  it('a moderator cannot read verification evidence but an admin can', () => {
    expect(can(moderator, 'read_evidence', { kind: 'verification_evidence' })).toBe(false);
    expect(can(admin, 'read_evidence', { kind: 'verification_evidence' })).toBe(true);
  });

  it('a moderator can still review ordinary listing content', () => {
    expect(can(moderator, 'view_private', listingOfA('submitted'))).toBe(true);
    expect(can(moderator, 'suspend', listingOfA('approved'))).toBe(true);
  });

  it('a lister and seeker are not staff', () => {
    expect(isStaff('lister')).toBe(false);
    expect(isStaff('seeker')).toBe(false);
    expect(isStaff('moderator')).toBe(true);
    expect(isStaff('admin')).toBe(true);
  });
});

describe('listing creation and submission', () => {
  it('only listers (or admins) create listings; seekers cannot', () => {
    expect(can(listerA, 'create', listingOfA())).toBe(true);
    expect(can(admin, 'create', listingOfA())).toBe(true);
    expect(can(seeker, 'create', listingOfA())).toBe(false);
  });

  it('a lister submits their own draft but not an approved listing', () => {
    expect(can(listerA, 'submit_for_review', listingOfA('draft'))).toBe(true);
    expect(can(listerA, 'submit_for_review', listingOfA('approved'))).toBe(false);
    expect(can(listerB, 'submit_for_review', listingOfA('draft'))).toBe(false);
  });
});

describe('E2 — availability reconfirmation', () => {
  it('only the accountable lister or an admin may reconfirm', () => {
    expect(can(listerA, 'reconfirm_availability', listingOfA('approved'))).toBe(true);
    expect(can(admin, 'reconfirm_availability', listingOfA('approved'))).toBe(true);
    expect(can(listerB, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
    expect(can(seeker, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
    // A moderator reviews content but does not confirm availability on the
    // lister's behalf.
    expect(can(moderator, 'reconfirm_availability', listingOfA('approved'))).toBe(false);
  });
});

describe('assertCan', () => {
  it('throws AuthorizationError with a safe message when denied', () => {
    expect(() => assertCan(listerB, 'edit', listingOfA('draft'))).toThrow(AuthorizationError);
    try {
      assertCan(listerB, 'edit', listingOfA('draft'));
    } catch (e) {
      // The message must not leak internal detail.
      expect((e as Error).message).toBe('You do not have permission to make this change.');
      expect((e as AuthorizationError).status).toBe(403);
    }
  });

  it('does not throw when permitted', () => {
    expect(() => assertCan(listerA, 'edit', listingOfA('draft'))).not.toThrow();
  });
});
