'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { AuthorizationError } from '@/lib/domain/authorization';
import { getRecord } from '@/lib/data/authoring-store';
import {
  createInspection,
  recordContactInquiry,
  updateInspectionStatus,
} from '@/lib/data/engagement';
import type { InspectionStatus } from '@/lib/data/engagement-store';
import { getNow } from '@/lib/now';
import { getOrCreateVisitorId } from './visitor';

export interface InspectionFormState {
  ok?: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
  /** Echoed back so the form repopulates after a validation error. */
  values?: Record<string, string>;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

/**
 * Record an explicit contact-click inquiry (F5). Called when a visitor chooses
 * to call or open WhatsApp — never on page load (F1). Returns nothing sensitive.
 */
export async function recordContactAction(
  listingId: string,
  kind: 'call' | 'whatsapp',
): Promise<{ ok: boolean }> {
  const visitorId = await getOrCreateVisitorId();
  const limit = checkRateLimit(`inquiry:${visitorId}:${listingId}:${kind}`, 15, 60);
  if (!limit.allowed) return { ok: false };
  recordContactInquiry(listingId, kind === 'call' ? 'call_click' : 'whatsapp_click', getNow());
  return { ok: true };
}

/** Submit an inspection request (G1). Consent + required fields enforced server-side. */
export async function submitInspectionAction(
  listingId: string,
  listingTitle: string,
  _prev: InspectionFormState,
  formData: FormData,
): Promise<InspectionFormState> {
  const visitorId = await getOrCreateVisitorId();
  const limit = checkRateLimit(`inspection:${visitorId}:${listingId}`, 8, 60 * 10);
  if (!limit.allowed) {
    return { error: 'Too many attempts were made in a short period. Please try again later.' };
  }

  const values = {
    name: str(formData, 'name'),
    phone: str(formData, 'phone'),
    date: str(formData, 'date'),
    time: str(formData, 'time'),
    message: str(formData, 'message'),
  };
  const assignedListerId = getRecord(listingId)?.assignedListerId ?? null;
  const result = createInspection(
    listingId,
    listingTitle,
    assignedListerId,
    {
      name: values.name,
      phone: values.phone,
      preferredDate: values.date,
      preferredTime: values.time,
      message: values.message,
      consent: formData.get('consent') === 'on',
    },
    getNow(),
  );

  if (!result.ok) return { errors: result.errors, values };
  revalidatePath('/dashboard/inspections');
  return { ok: true, message: 'Request sent. The lister can now contact you to confirm.' };
}

const STATUSES: InspectionStatus[] = [
  'new',
  'acknowledged',
  'scheduled',
  'completed',
  'cancelled',
  'spam',
];

/** Assigned lister updates an inspection's status (G3). */
export async function updateInspectionStatusAction(
  inspectionId: string,
  _prev: InspectionFormState,
  formData: FormData,
): Promise<InspectionFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const status = str(formData, 'status') as InspectionStatus;
  if (!STATUSES.includes(status)) return { error: 'Choose a valid status.' };
  try {
    const result = updateInspectionStatus(user, inspectionId, status, getNow());
    if (result === null) return { error: 'That request no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return { error: 'You do not have permission to make this change.' };
    }
    throw e;
  }
  revalidatePath('/dashboard/inspections');
  return { ok: true, message: 'Status updated.' };
}
