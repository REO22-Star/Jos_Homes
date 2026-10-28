'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/current-actor';
import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError } from '@/lib/domain/authorization';
import { WorkflowError, type WorkflowAction } from '@/lib/domain/workflow';
import type { ListingDraftInput } from '@/lib/domain/listing-input';
import type { FieldErrors } from '@/lib/domain/listing-input';
import {
  addMedia,
  createDraft,
  moderate,
  moderateMedia,
  reconfirmAvailability,
  removeMedia,
  setAvailability,
  setCover,
  submitForReview,
  updateDraft,
  type UploadFile,
} from '@/lib/data/authoring';
import type { AvailabilityState } from '@/lib/domain/types';
import { toPublicListing } from '@/lib/domain/projection';
import { notifyMatchingSavedSearches } from '@/lib/data/seeker';
import { getNow } from '@/lib/now';

export interface ListingFormState {
  errors?: FieldErrors;
  error?: string;
  message?: string;
}

const DENIED = 'You do not have permission to make this change.';

function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === 'string' ? v : undefined;
}
function num(fd: FormData, key: string): number | undefined {
  const v = str(fd, key);
  return v && v.trim() !== '' ? Number(v) : undefined;
}
function enumOrUndef(fd: FormData, key: string): string | undefined {
  const v = str(fd, key);
  return v && v.trim() !== '' ? v : undefined;
}
function list(fd: FormData, key: string): string[] | undefined {
  const v = str(fd, key);
  if (v === undefined) return undefined;
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Map the editor form fields into a draft input (only keys present are sent). */
function formToInput(fd: FormData): ListingDraftInput {
  return {
    title: str(fd, 'title'),
    description: str(fd, 'description'),
    areaSlug: enumOrUndef(fd, 'areaSlug'),
    propertyType: enumOrUndef(fd, 'propertyType') as ListingDraftInput['propertyType'],
    bedrooms: num(fd, 'bedrooms'),
    bathrooms: num(fd, 'bathrooms'),
    toilets: num(fd, 'toilets'),
    parkingSpaces: num(fd, 'parkingSpaces'),
    furnishingState: enumOrUndef(fd, 'furnishingState') as ListingDraftInput['furnishingState'],
    privateAddressLine: str(fd, 'privateAddressLine'),
    privateAddressNotes: str(fd, 'privateAddressNotes'),
    publicLandmark: str(fd, 'publicLandmark'),
    approxLocationLabel: str(fd, 'approxLocationLabel'),
    waterSource: str(fd, 'waterSource'),
    electricityMeter: str(fd, 'electricityMeter'),
    features: list(fd, 'features'),
    houseRules: list(fd, 'houseRules'),
    rentNaira: num(fd, 'rentNaira'),
    rentFrequency: enumOrUndef(fd, 'rentFrequency') as ListingDraftInput['rentFrequency'],
    feeDisclosure: enumOrUndef(fd, 'feeDisclosure') as ListingDraftInput['feeDisclosure'],
    agencyNaira: num(fd, 'agencyNaira'),
    legalNaira: num(fd, 'legalNaira'),
    cautionNaira: num(fd, 'cautionNaira'),
    serviceNaira: num(fd, 'serviceNaira'),
    otherNaira: num(fd, 'otherNaira'),
    otherLabel: str(fd, 'otherLabel'),
    availableFrom: str(fd, 'availableFrom'),
    contactPhone: str(fd, 'contactPhone'),
    authorizedToAdvertise: fd.get('authorizedToAdvertise') === 'on',
  };
}

/** Create a blank draft and open its editor. Listers/admins only. */
export async function createDraftAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/dashboard/listings');
  let id: string;
  try {
    const result = createDraft(user, {}, getNow());
    if (!result.ok) redirect('/dashboard/listings');
    id = result.record.id;
  } catch (e) {
    if (e instanceof AuthorizationError) redirect('/dashboard?denied=1');
    throw e;
  }
  redirect(`/dashboard/listings/${id}`);
}

export async function saveDraftAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    const result = updateDraft(user, id, formToInput(formData), getNow());
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { errors: result.errors };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath(`/dashboard/listings/${id}`);
  return { message: 'Draft saved.' };
}

export async function submitAction(
  id: string,
  _prev: ListingFormState,
  _formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    const result = submitForReview(user, id, getNow());
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) {
      return { errors: result.errors, error: 'Some required details are still missing.' };
    }
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/search');
  redirect('/dashboard/listings?submitted=1');
}

const MODERATION_ACTIONS: WorkflowAction[] = [
  'approve',
  'request_changes',
  'reject',
  'suspend',
  'reinstate',
  'archive',
];

/** Moderator/admin decision. The chosen action comes from the submit button. */
export async function moderateAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const action = str(formData, 'action') as WorkflowAction | undefined;
  if (!action || !MODERATION_ACTIONS.includes(action)) {
    return { error: 'Choose a valid moderation action.' };
  }
  const reason = str(formData, 'reason');
  const now = getNow();
  try {
    const result = moderate(user, id, action, now, reason);
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { error: result.error };
    // On approval, alert seekers whose saved search matches the new listing.
    if (action === 'approve') {
      notifyMatchingSavedSearches(toPublicListing(result.record, now), now);
    }
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    if (e instanceof WorkflowError) return { error: e.message };
    throw e;
  }
  revalidatePath('/search');
  revalidatePath('/dashboard/review');
  redirect('/dashboard/review?done=1');
}

// --- Media (Milestone 3) ---------------------------------------------------

export async function uploadMediaAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };

  const picked = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (picked.length === 0) return { error: 'Choose at least one image to upload.' };

  const files: UploadFile[] = [];
  for (const f of picked) {
    files.push({
      fileName: f.name,
      mimeType: f.type,
      bytes: new Uint8Array(await f.arrayBuffer()),
    });
  }

  try {
    const res = addMedia(user, id, files, getNow());
    if (res === null) return { error: 'That listing no longer exists.' };
    if (!res.ok) return { error: res.error };
    revalidatePath(`/dashboard/listings/${id}`);
    // Some files may have been rejected while others succeeded (H1/H2).
    if (res.errors.length > 0) {
      return {
        error: res.errors.join(' '),
        message: res.added > 0 ? `${res.added} image(s) uploaded.` : undefined,
      };
    }
    return { message: `${res.added} image(s) uploaded.` };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
}

async function mediaMutation(
  id: string,
  formData: FormData,
  run: (user: AuthUser, mediaId: string) => { ok: boolean; error?: string } | null,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const mediaId = str(formData, 'mediaId');
  if (!mediaId) return { error: 'No image was selected.' };
  try {
    const result = run(user, mediaId);
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath(`/dashboard/listings/${id}`);
  return { message: 'Updated.' };
}

export async function removeMediaAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  return mediaMutation(id, formData, (user, mediaId) => removeMedia(user, id, mediaId, getNow()));
}

export async function setCoverAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  return mediaMutation(id, formData, (user, mediaId) => setCover(user, id, mediaId));
}

// --- Availability (Milestone 4) --------------------------------------------

const AVAILABILITY_VALUES: AvailabilityState[] = [
  'available',
  'paused',
  'taken',
  'inspection_ongoing',
  'application_pending',
];

export async function reconfirmAction(
  id: string,
  _prev: ListingFormState,
  _formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    const result = reconfirmAvailability(user, id, getNow());
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/search');
  revalidatePath('/dashboard/listings');
  return { message: 'Availability reconfirmed.' };
}

export async function setAvailabilityAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const next = str(formData, 'availability') as AvailabilityState | undefined;
  if (!next || !AVAILABILITY_VALUES.includes(next)) {
    return { error: 'Choose a valid availability status.' };
  }
  try {
    const result = setAvailability(user, id, next, getNow());
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/search');
  revalidatePath('/dashboard/listings');
  return { message: 'Availability updated.' };
}

export async function moderateMediaAction(
  id: string,
  _prev: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const mediaId = str(formData, 'mediaId');
  const decision = str(formData, 'decision');
  if (!mediaId || (decision !== 'approve' && decision !== 'reject')) {
    return { error: 'Choose a valid media decision.' };
  }
  try {
    const result = moderateMedia(user, id, mediaId, decision, getNow());
    if (result === null) return { error: 'That listing no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath(`/dashboard/review/${id}`);
  revalidatePath('/search');
  return { message: `Image ${decision === 'approve' ? 'approved' : 'rejected'}.` };
}
