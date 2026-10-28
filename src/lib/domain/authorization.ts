import type { ListingWorkflowState } from './types';

/**
 * Central authorization rules.
 *
 * Every server-side write must consult `can`/`assertCan`. The database RLS
 * policies in supabase/migrations/0003_rls.sql mirror these rules — both layers
 * must agree, and the database is the backstop if an application check is missed.
 *
 * Covers acceptance C1 (lister owns edits), C2 (no self-approval),
 * C3 (no role escalation) and J3 (moderator ≠ evidence access).
 */

export type UserRole = 'seeker' | 'lister' | 'moderator' | 'admin';
export type Role = UserRole | 'guest';
export type AccountStatus = 'active' | 'suspended' | 'closed';

export interface Actor {
  /** null for an unauthenticated guest. */
  id: string | null;
  role: Role;
  accountStatus: AccountStatus;
}

export const GUEST: Actor = { id: null, role: 'guest', accountStatus: 'active' };

// --- Resources -------------------------------------------------------------

export interface ListingResource {
  kind: 'listing';
  createdBy: string;
  assignedListerId: string;
  workflowState: ListingWorkflowState;
}

export interface PropertyResource {
  kind: 'property';
  createdBy: string;
  assignedListerId: string;
}

export interface MediaResource {
  kind: 'media';
  /** Profile id of the lister who manages the parent listing. */
  listingListerId: string;
}

export interface ProfileResource {
  kind: 'profile';
  profileId: string;
}

export interface InquiryResource {
  kind: 'inquiry';
  assignedListerId: string;
}

/** Identity/verification evidence. Deliberately has no owner field. */
export interface EvidenceResource {
  kind: 'verification_evidence';
}

export type Resource =
  | ListingResource
  | PropertyResource
  | MediaResource
  | ProfileResource
  | InquiryResource
  | EvidenceResource;

export type Action =
  | 'view_private'
  | 'create'
  | 'edit'
  | 'submit_for_review'
  | 'approve'
  | 'request_changes'
  | 'reject'
  | 'suspend'
  | 'archive'
  | 'reconfirm_availability'
  | 'change_availability'
  | 'moderate_media'
  | 'read_evidence'
  | 'change_role';

// --- Helpers ---------------------------------------------------------------

export function isStaff(role: Role): boolean {
  return role === 'moderator' || role === 'admin';
}

/** A suspended or closed account may still read public pages but never write. */
function canAct(actor: Actor): boolean {
  return actor.accountStatus === 'active';
}

function manages(actor: Actor, resource: { createdBy: string; assignedListerId: string }): boolean {
  if (!actor.id) return false;
  return resource.createdBy === actor.id || resource.assignedListerId === actor.id;
}

/** Workflow states in which a lister may still edit their own listing content. */
const LISTER_EDITABLE_STATES: ListingWorkflowState[] = ['draft', 'submitted', 'changes_requested'];

// --- The rule table --------------------------------------------------------

export function can(actor: Actor, action: Action, resource: Resource): boolean {
  // Guests can never perform any of these actions; public reading is handled by
  // the public projection, not by this function.
  if (actor.role === 'guest' || !actor.id) return false;
  if (!canAct(actor)) return false;

  switch (resource.kind) {
    case 'listing':
      return canListing(actor, action, resource);
    case 'property':
      return canProperty(actor, action, resource);
    case 'media':
      return canMedia(actor, action, resource);
    case 'profile':
      return canProfile(actor, action, resource);
    case 'inquiry':
      return canInquiry(actor, action, resource);
    case 'verification_evidence':
      // Only an administrator may read identity/verification evidence.
      // A moderator can review ordinary listing content but NOT evidence (J3).
      return action === 'read_evidence' && actor.role === 'admin';
  }
}

function canListing(actor: Actor, action: Action, listing: ListingResource): boolean {
  const owns = manages(actor, listing);

  switch (action) {
    case 'view_private':
      return owns || isStaff(actor.role);

    case 'create':
      return actor.role === 'lister' || actor.role === 'admin';

    case 'edit':
      if (actor.role === 'admin') return true;
      // A lister edits only their own listing, and only while it is still
      // in an editable workflow state.
      return owns && LISTER_EDITABLE_STATES.includes(listing.workflowState);

    case 'submit_for_review':
      if (actor.role === 'admin') return true;
      return (
        owns && (listing.workflowState === 'draft' || listing.workflowState === 'changes_requested')
      );

    case 'approve':
    case 'reject':
    case 'request_changes':
      // Only staff may decide, and never on their own listing — a moderator who
      // happens to own a listing still cannot approve or return it (C2).
      return isStaff(actor.role) && !owns;

    case 'suspend':
      return isStaff(actor.role);

    case 'archive':
      // A lister may archive their own listing; an admin may archive any.
      return owns || actor.role === 'admin';

    case 'reconfirm_availability':
    case 'change_availability':
      // Only the accountable lister (or an admin) may confirm or change the
      // public availability of a listing (E2/E4).
      return owns || actor.role === 'admin';

    default:
      return false;
  }
}

function canProperty(actor: Actor, action: Action, property: PropertyResource): boolean {
  const owns = manages(actor, property);
  switch (action) {
    case 'view_private':
      return owns || isStaff(actor.role);
    case 'create':
      return actor.role === 'lister' || actor.role === 'admin';
    case 'edit':
      return owns || actor.role === 'admin';
    default:
      return false;
  }
}

function canMedia(actor: Actor, action: Action, media: MediaResource): boolean {
  const owns = actor.id === media.listingListerId;
  switch (action) {
    case 'view_private':
      return owns || isStaff(actor.role);
    case 'create':
    case 'edit':
      // A lister may attach/reorder/remove only their own media (H3).
      return owns || actor.role === 'admin';
    case 'moderate_media':
      // Approving media is a moderation act; a lister cannot approve their own.
      return isStaff(actor.role);
    default:
      return false;
  }
}

function canProfile(actor: Actor, action: Action, profile: ProfileResource): boolean {
  const isSelf = actor.id === profile.profileId;
  switch (action) {
    case 'view_private':
      return isSelf || isStaff(actor.role);
    case 'edit':
      return isSelf || actor.role === 'admin';
    case 'change_role':
      // Only an administrator may change roles, and never their own — this
      // blocks both privilege escalation and self-demotion lockouts (C3).
      return actor.role === 'admin' && !isSelf;
    default:
      return false;
  }
}

function canInquiry(actor: Actor, action: Action, inquiry: InquiryResource): boolean {
  const assigned = actor.id === inquiry.assignedListerId;
  switch (action) {
    case 'view_private':
      // Only the assigned lister and authorized staff see requester details (G2).
      return assigned || isStaff(actor.role);
    case 'edit':
      return assigned || actor.role === 'admin';
    default:
      return false;
  }
}

// --- Enforcement helper ----------------------------------------------------

export class AuthorizationError extends Error {
  readonly status = 403;
  constructor(message = 'You do not have permission to make this change.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/** Throws when the actor may not perform the action. Use on every server write. */
export function assertCan(actor: Actor, action: Action, resource: Resource): void {
  if (!can(actor, action, resource)) {
    throw new AuthorizationError();
  }
}
