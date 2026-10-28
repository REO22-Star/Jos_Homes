import { randomUUID } from 'node:crypto';
import type { AuthUser } from '@/lib/auth/types';
import {
  assertCan,
  isStaff,
  AuthorizationError,
  type Action,
  type Actor,
  type ListingResource,
  type MediaResource,
} from '@/lib/domain/authorization';
import { hasEnoughImages, validateImageUpload } from '@/lib/domain/media';
import type { InternalMedia } from '@/lib/domain/internal-types';
import type { AvailabilityState } from '@/lib/domain/types';
import { deleteBlob, putBlob } from '@/lib/media/storage';
import {
  listingDraftSchema,
  listingSubmissionSchema,
  toFieldErrors,
  type FieldErrors,
  type ListingDraftInput,
} from '@/lib/domain/listing-input';
import { nairaToMinor } from '@/lib/domain/money';
import {
  ACTION_TARGET,
  assertWorkflowTransition,
  type WorkflowAction,
} from '@/lib/domain/workflow';
import { areaBySlug } from './areas';
import {
  appendAudit,
  getRecord,
  nextReferenceCode,
  putRecord,
  recordsForLister,
  reviewQueue,
  type AuthoredRecord,
  type StatusHistoryEntry,
} from './authoring-store';

/**
 * Listing authoring + moderation service.
 *
 * Every state change consults BOTH the workflow state machine (is this move
 * structurally valid?) and the authorization rules (may this actor do it?), and
 * records status history + an audit entry. This is the single place M2 writes
 * happen; server actions are thin wrappers over these functions.
 */

export type AuthoringResult =
  { ok: true; record: AuthoredRecord } | { ok: false; errors: FieldErrors };

function actorOf(user: AuthUser): Actor {
  return { id: user.id, role: user.role, accountStatus: user.accountStatus };
}

function resourceOf(record: AuthoredRecord): ListingResource {
  return {
    kind: 'listing',
    createdBy: record.createdByProfileId,
    assignedListerId: record.assignedListerId,
    workflowState: record.workflowState,
  };
}

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return `${base || 'listing'}-${id.slice(0, 6)}`;
}

function historyEntry(
  actorId: string | null,
  changeType: string,
  prev: AuthoredRecord['workflowState'] | null,
  next: AuthoredRecord['workflowState'] | null,
  atISO: string,
  reason?: string,
): StatusHistoryEntry {
  return {
    id: `h-${randomUUID().slice(0, 8)}`,
    atISO,
    actorId,
    changeType,
    previousWorkflowState: prev,
    newWorkflowState: next,
    previousAvailabilityState: null,
    newAvailabilityState: null,
    reasonCode: null,
    note: reason ?? null,
  };
}

/** Apply lister-supplied fields onto a record's property + listing columns. */
function applyInput(record: AuthoredRecord, input: ListingDraftInput): void {
  const p = record.property;
  if (input.title !== undefined) record.title = input.title;
  if (input.description !== undefined) record.description = input.description;
  if (input.areaSlug !== undefined) {
    const area = areaBySlug(input.areaSlug);
    if (area) {
      p.areaSlug = area.slug;
      p.areaName = area.name;
    }
  }
  if (input.propertyType !== undefined) p.propertyType = input.propertyType;
  if (input.bedrooms !== undefined) p.bedrooms = input.bedrooms;
  if (input.bathrooms !== undefined) p.bathrooms = input.bathrooms;
  if (input.toilets !== undefined) p.toilets = input.toilets;
  if (input.parkingSpaces !== undefined) p.parkingSpaces = input.parkingSpaces;
  if (input.furnishingState !== undefined) p.furnishingState = input.furnishingState;
  if (input.privateAddressLine !== undefined) p.privateAddressLine = input.privateAddressLine;
  if (input.privateAddressNotes !== undefined)
    p.privateAddressNotes = input.privateAddressNotes || null;
  if (input.publicLandmark !== undefined) p.publicLandmark = input.publicLandmark;
  if (input.approxLocationLabel !== undefined) p.approxLocationLabel = input.approxLocationLabel;
  if (input.waterSource !== undefined) p.waterSource = input.waterSource || null;
  if (input.electricityMeter !== undefined) p.electricityMeter = input.electricityMeter || null;
  if (input.features !== undefined) p.features = input.features;
  if (input.houseRules !== undefined) p.houseRules = input.houseRules;

  if (input.rentNaira !== undefined) record.rentMinor = nairaToMinor(input.rentNaira);
  if (input.rentFrequency !== undefined) record.rentFrequency = input.rentFrequency;
  if (input.contactPhone !== undefined) record.lister.privatePhoneE164 = input.contactPhone;
  if (input.availableFrom !== undefined) record.availableFromISO = input.availableFrom || null;
  if (input.authorizedToAdvertise !== undefined) {
    record.authorizedToAdvertise = input.authorizedToAdvertise;
  }

  if (input.feeDisclosure !== undefined) {
    record.feeDisclosure = input.feeDisclosure;
    if (input.feeDisclosure === 'none_known') {
      // "No additional fees" clears any optional fee amounts so unknown is never
      // silently shown as a value.
      record.agencyMinor = undefined;
      record.legalMinor = undefined;
      record.cautionMinor = undefined;
      record.serviceMinor = undefined;
      record.otherMinor = undefined;
      record.otherLabel = undefined;
    }
  }
  if (record.feeDisclosure !== 'none_known') {
    const fee = (n: number | undefined) => (n === undefined ? undefined : nairaToMinor(n));
    if (input.agencyNaira !== undefined) record.agencyMinor = fee(input.agencyNaira);
    if (input.legalNaira !== undefined) record.legalMinor = fee(input.legalNaira);
    if (input.cautionNaira !== undefined) record.cautionMinor = fee(input.cautionNaira);
    if (input.serviceNaira !== undefined) record.serviceMinor = fee(input.serviceNaira);
    if (input.otherNaira !== undefined) record.otherMinor = fee(input.otherNaira);
    if (input.otherLabel !== undefined) record.otherLabel = input.otherLabel || undefined;
  }
}

function imageCount(record: AuthoredRecord): number {
  return record.media.filter((m) => m.kind === 'image').length;
}

/** Reconstruct the submission-validation input shape from a stored record. */
function submissionCandidate(record: AuthoredRecord): Record<string, unknown> {
  return {
    title: record.title,
    description: record.description,
    areaSlug: record.property.areaSlug,
    propertyType: record.property.propertyType,
    privateAddressLine: record.property.privateAddressLine,
    rentNaira: record.rentMinor / 100,
    rentFrequency: record.rentFrequency,
    feeDisclosure: record.feeDisclosure,
    availableFrom: record.availableFromISO ?? '',
    contactPhone: record.lister.privatePhoneE164,
    authorizedToAdvertise: record.authorizedToAdvertise,
  };
}

// --- Lister operations -----------------------------------------------------

export function createDraft(user: AuthUser, input: ListingDraftInput, now: Date): AuthoringResult {
  const actor = actorOf(user);
  // A seeker/guest cannot create; a lister or admin can.
  assertCan(actor, 'create', {
    kind: 'listing',
    createdBy: user.id,
    assignedListerId: user.id,
    workflowState: 'draft',
  });

  const parsed = listingDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };

  const id = randomUUID();
  const atISO = now.toISOString();
  const record: AuthoredRecord = {
    id,
    slug: slugify(parsed.data.title ?? 'listing', id),
    referenceCode: nextReferenceCode(),
    title: parsed.data.title ?? 'Untitled listing',
    description: parsed.data.description ?? '',
    workflowState: 'draft',
    availabilityState: 'available',
    rentMinor: parsed.data.rentNaira !== undefined ? nairaToMinor(parsed.data.rentNaira) : 0,
    rentFrequency: parsed.data.rentFrequency ?? 'annual',
    feeDisclosure: parsed.data.feeDisclosure ?? 'not_stated',
    availableFromISO: parsed.data.availableFrom || null,
    lastConfirmedAt: new Date(0),
    createdByProfileId: user.id,
    assignedListerId: user.id,
    authorizedToAdvertise: parsed.data.authorizedToAdvertise ?? false,
    property: {
      id: randomUUID(),
      areaName: '',
      areaSlug: '',
      publicLandmark: '',
      approxLocationLabel: '',
      privateAddressLine: '',
      privateAddressNotes: null,
      propertyType: 'self_contained',
      bedrooms: null,
      bathrooms: null,
      toilets: null,
      parkingSpaces: null,
      furnishingState: 'unfurnished',
      waterSource: null,
      electricityMeter: null,
      features: [],
      houseRules: [],
    },
    lister: {
      slug: `lister-${user.id.slice(0, 8)}`,
      displayName: user.displayName,
      listerType: 'landlord',
      privatePhoneE164: '',
      verifications: [],
    },
    media: [],
    qualifiedViews7d: 0,
    inquiries7d: 0,
    sponsorshipLabel: null,
    statusHistory: [historyEntry(user.id, 'created', null, 'draft', atISO)],
  };

  applyInput(record, parsed.data);
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'listing.create',
      targetType: 'listing',
      targetId: id,
      summary: record.title,
    },
    atISO,
  );
  return { ok: true, record };
}

export function updateDraft(
  user: AuthUser,
  id: string,
  input: ListingDraftInput,
  now: Date,
): AuthoringResult | null {
  const record = getRecord(id);
  if (!record) return null;
  // Enforces ownership AND that the listing is still in an editable state.
  assertCan(actorOf(user), 'edit', resourceOf(record));

  const parsed = listingDraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: toFieldErrors(parsed.error) };

  applyInput(record, parsed.data);
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'listing.update',
      targetType: 'listing',
      targetId: id,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

export function submitForReview(user: AuthUser, id: string, now: Date): AuthoringResult | null {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'submit_for_review', resourceOf(record));

  const check = listingSubmissionSchema.safeParse(submissionCandidate(record));
  if (!check.success) return { ok: false, errors: toFieldErrors(check.error) };
  if (!hasEnoughImages(imageCount(record))) {
    return { ok: false, errors: { images: 'Upload at least three usable property images.' } };
  }

  assertWorkflowTransition(record.workflowState, 'submitted');
  const prev = record.workflowState;
  record.workflowState = 'submitted';
  record.statusHistory.push(
    historyEntry(user.id, 'submitted', prev, 'submitted', now.toISOString()),
  );
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'listing.submit',
      targetType: 'listing',
      targetId: id,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

export function listMine(user: AuthUser): AuthoredRecord[] {
  return recordsForLister(user.id).sort((a, b) => a.title.localeCompare(b.title));
}

/** Human list of what still blocks submission, for the editor checklist. */
export function readinessFor(record: AuthoredRecord): string[] {
  const check = listingSubmissionSchema.safeParse(submissionCandidate(record));
  const errors = check.success ? [] : Object.values(toFieldErrors(check.error));
  if (!hasEnoughImages(imageCount(record))) {
    errors.push('Upload at least three usable property images.');
  }
  return errors;
}

/** The most recent moderator feedback note, if any (for change requests). */
export function lastModerationNote(record: AuthoredRecord): string | null {
  for (let i = record.statusHistory.length - 1; i >= 0; i--) {
    const h = record.statusHistory[i]!;
    if ((h.changeType === 'request_changes' || h.changeType === 'reject') && h.note) return h.note;
  }
  return null;
}

export function getMine(user: AuthUser, id: string): AuthoredRecord | null {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'view_private', resourceOf(record));
  return record;
}

// --- Moderator / admin operations -----------------------------------------

const WORKFLOW_TO_AUTH: Record<WorkflowAction, Action> = {
  submit_for_review: 'submit_for_review',
  approve: 'approve',
  request_changes: 'request_changes',
  reject: 'reject',
  suspend: 'suspend',
  reinstate: 'approve',
  archive: 'archive',
};

export function listReviewQueue(user: AuthUser): AuthoredRecord[] {
  if (!isStaff(user.role)) throw new AuthorizationError();
  return reviewQueue();
}

export function getForReview(user: AuthUser, id: string): AuthoredRecord | null {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'view_private', resourceOf(record));
  return record;
}

/**
 * Apply a moderation/lifecycle action. Checks the actor's permission AND the
 * workflow transition, then records history + audit. A reason is required for
 * request_changes and reject so the lister receives actionable feedback.
 */
export function moderate(
  user: AuthUser,
  id: string,
  action: WorkflowAction,
  now: Date,
  reason?: string,
): { ok: true; record: AuthoredRecord } | { ok: false; error: string } | null {
  const record = getRecord(id);
  if (!record) return null;

  assertCan(actorOf(user), WORKFLOW_TO_AUTH[action], resourceOf(record));

  if ((action === 'request_changes' || action === 'reject') && !reason?.trim()) {
    return { ok: false, error: 'Give a reason so the lister knows what to change.' };
  }

  const target = ACTION_TARGET[action];
  assertWorkflowTransition(record.workflowState, target);

  const prev = record.workflowState;
  record.workflowState = target;
  if (action === 'approve' || action === 'reinstate') {
    record.availabilityState = 'available';
    record.lastConfirmedAt = now;
  }
  record.statusHistory.push(historyEntry(user.id, action, prev, target, now.toISOString(), reason));
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: `listing.${action}`,
      targetType: 'listing',
      targetId: id,
      summary: reason ?? null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

// --- Media operations (Milestone 3) ---------------------------------------

function mediaResourceOf(record: AuthoredRecord): MediaResource {
  return { kind: 'media', listingListerId: record.assignedListerId };
}

const MEDIA_EDITABLE_STATES = ['draft', 'changes_requested', 'rejected'];

export interface UploadFile {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}

export type AddMediaResult =
  | { ok: true; record: AuthoredRecord; added: number; errors: string[] }
  | { ok: false; error: string };

/**
 * Attach uploaded images to a listing. Each file is validated server-side; a bad
 * file is skipped with a message and never touches the rest of the draft (H1/H2).
 * Only the lister who manages the listing (or an admin) may attach media (H3).
 */
export function addMedia(
  user: AuthUser,
  listingId: string,
  files: UploadFile[],
  now: Date,
): AddMediaResult | null {
  const record = getRecord(listingId);
  if (!record) return null;
  assertCan(actorOf(user), 'create', mediaResourceOf(record));
  if (!MEDIA_EDITABLE_STATES.includes(record.workflowState)) {
    return { ok: false, error: 'Media can only be changed while the listing is editable.' };
  }

  const errors: string[] = [];
  let added = 0;
  for (const file of files) {
    const problem = validateImageUpload(
      { fileName: file.fileName, mimeType: file.mimeType, sizeBytes: file.bytes.byteLength },
      imageCount(record),
    );
    if (problem) {
      errors.push(`${file.fileName}: ${problem}`);
      continue;
    }
    const objectId = randomUUID();
    putBlob('public', objectId, file.bytes, file.mimeType);
    const media: InternalMedia = {
      id: randomUUID(),
      kind: 'image',
      placeholderHue: 210,
      alt: record.title || 'Property photo',
      moderationState: 'pending',
      objectId,
      mimeType: file.mimeType,
      sizeBytes: file.bytes.byteLength,
    };
    record.media.push(media);
    added += 1;
  }

  if (added > 0) {
    putRecord(record);
    appendAudit(
      {
        actorId: user.id,
        action: 'media.upload',
        targetType: 'listing',
        targetId: listingId,
        summary: `${added} image(s)`,
      },
      now.toISOString(),
    );
  }
  return { ok: true, record, added, errors };
}

type MediaMutation = { ok: true; record: AuthoredRecord } | { ok: false; error: string } | null;

export function removeMedia(
  user: AuthUser,
  listingId: string,
  mediaId: string,
  now: Date,
): MediaMutation {
  const record = getRecord(listingId);
  if (!record) return null;
  assertCan(actorOf(user), 'edit', mediaResourceOf(record));
  const idx = record.media.findIndex((m) => m.id === mediaId);
  if (idx === -1) return { ok: false, error: 'That image was not found.' };
  const [removed] = record.media.splice(idx, 1);
  if (removed?.objectId) deleteBlob('public', removed.objectId);
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'media.remove',
      targetType: 'listing',
      targetId: listingId,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

/** Move a media item to the front so it becomes the cover image. */
export function setCover(user: AuthUser, listingId: string, mediaId: string): MediaMutation {
  const record = getRecord(listingId);
  if (!record) return null;
  assertCan(actorOf(user), 'edit', mediaResourceOf(record));
  const idx = record.media.findIndex((m) => m.id === mediaId);
  if (idx > 0) {
    const [item] = record.media.splice(idx, 1);
    record.media.unshift(item!);
    putRecord(record);
  }
  return { ok: true, record };
}

// --- Availability (Milestone 4) -------------------------------------------

function availabilityHistoryEntry(
  actorId: string | null,
  changeType: string,
  prev: AvailabilityState,
  next: AvailabilityState,
  atISO: string,
): StatusHistoryEntry {
  return {
    id: `h-${randomUUID().slice(0, 8)}`,
    atISO,
    actorId,
    changeType,
    previousWorkflowState: null,
    newWorkflowState: null,
    previousAvailabilityState: prev,
    newAvailabilityState: next,
    reasonCode: null,
    note: null,
  };
}

/** Availability states a lister may set directly (not the system/review states). */
const LISTER_AVAILABILITY: AvailabilityState[] = [
  'available',
  'paused',
  'taken',
  'inspection_ongoing',
  'application_pending',
];

/**
 * Reconfirm availability: resets the freshness clock and clears an overdue
 * state (E1). Only the accountable lister or an admin may (E2).
 */
export function reconfirmAvailability(user: AuthUser, id: string, now: Date): MediaMutation {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'reconfirm_availability', resourceOf(record));
  if (record.workflowState !== 'approved') {
    return { ok: false, error: 'Only an approved listing can be reconfirmed.' };
  }
  const prev = record.availabilityState;
  record.lastConfirmedAt = now;
  if (record.availabilityState === 'confirmation_overdue') record.availabilityState = 'available';
  record.statusHistory.push(
    availabilityHistoryEntry(
      user.id,
      'reconfirm',
      prev,
      record.availabilityState,
      now.toISOString(),
    ),
  );
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'listing.reconfirm',
      targetType: 'listing',
      targetId: id,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

/** Change public availability (mark taken/paused/available, etc.) — E4. */
export function setAvailability(
  user: AuthUser,
  id: string,
  newState: AvailabilityState,
  now: Date,
): MediaMutation {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'change_availability', resourceOf(record));
  if (record.workflowState !== 'approved') {
    return { ok: false, error: 'Only an approved listing’s availability can be changed.' };
  }
  if (record.availabilityState === 'under_review') {
    return { ok: false, error: 'This listing is under review; its availability is locked.' };
  }
  if (!LISTER_AVAILABILITY.includes(newState)) {
    return { ok: false, error: 'That availability status is not allowed.' };
  }
  const prev = record.availabilityState;
  record.availabilityState = newState;
  // Marking a listing available again also reconfirms its freshness.
  if (newState === 'available') record.lastConfirmedAt = now;
  record.statusHistory.push(
    availabilityHistoryEntry(
      user.id,
      `availability_${newState}`,
      prev,
      newState,
      now.toISOString(),
    ),
  );
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: `listing.availability.${newState}`,
      targetType: 'listing',
      targetId: id,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

/** Staff places an approved listing under review (e.g. from a report) — E5. */
export function placeUnderReview(user: AuthUser, id: string, now: Date): MediaMutation {
  const record = getRecord(id);
  if (!record) return null;
  assertCan(actorOf(user), 'suspend', resourceOf(record)); // staff-only
  if (record.workflowState !== 'approved') {
    return { ok: false, error: 'Only an approved listing can be placed under review.' };
  }
  const prev = record.availabilityState;
  record.availabilityState = 'under_review';
  record.statusHistory.push(
    availabilityHistoryEntry(user.id, 'under_review', prev, 'under_review', now.toISOString()),
  );
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: 'listing.under_review',
      targetType: 'listing',
      targetId: id,
      summary: null,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}

/** Moderator/admin approves or rejects a single image (B3/H). */
export function moderateMedia(
  user: AuthUser,
  listingId: string,
  mediaId: string,
  decision: 'approve' | 'reject',
  now: Date,
): MediaMutation {
  const record = getRecord(listingId);
  if (!record) return null;
  assertCan(actorOf(user), 'moderate_media', mediaResourceOf(record));
  const media = record.media.find((m) => m.id === mediaId);
  if (!media) return { ok: false, error: 'That image was not found.' };
  media.moderationState = decision === 'approve' ? 'approved' : 'rejected';
  putRecord(record);
  appendAudit(
    {
      actorId: user.id,
      action: `media.${decision}`,
      targetType: 'listing',
      targetId: listingId,
      summary: mediaId,
    },
    now.toISOString(),
  );
  return { ok: true, record };
}
