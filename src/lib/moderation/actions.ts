'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { getAuthProvider } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rate-limit';
import { AuthorizationError } from '@/lib/domain/authorization';
import { isValidResolution, type ReportResolution } from '@/lib/domain/reports';
import type { VerificationType } from '@/lib/domain/types';
import { ISSUABLE_VERIFICATIONS } from '@/lib/domain/verification';
import { getRecord } from '@/lib/data/authoring-store';
import { createReport, resolveReport } from '@/lib/data/reports';
import { getReport } from '@/lib/data/reports-store';
import { issueVerification, revokeVerification } from '@/lib/data/verification';
import { getNow } from '@/lib/now';
import { getOrCreateVisitorId } from '@/lib/engagement/visitor';

export interface ModState {
  ok?: boolean;
  message?: string;
  error?: string;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

const DENIED = 'You do not have permission to make this change.';

/** Public: submit a report on a listing (rate-limited; reporter stays anonymous, I1). */
export async function submitReportAction(
  listingId: string,
  listingTitle: string,
  _prev: ModState,
  formData: FormData,
): Promise<ModState> {
  const visitorId = await getOrCreateVisitorId();
  const limit = checkRateLimit(`report:${visitorId}:${listingId}`, 5, 60 * 10);
  if (!limit.allowed) {
    return { error: 'Too many attempts were made in a short period. Please try again later.' };
  }
  const result = createReport(
    {
      listingId,
      listingTitle,
      reportedListerId: getRecord(listingId)?.assignedListerId ?? null,
      reporterVisitorId: visitorId,
      reasonCode: str(formData, 'reason'),
      details: str(formData, 'details'),
    },
    getNow(),
  );
  if (!result.ok) return { error: result.error };
  return {
    ok: true,
    message: 'Report received. Our team will review the listing and its history.',
  };
}

/** Staff: resolve a report. `resolution` comes from the submit button value. */
export async function resolveReportAction(
  reportId: string,
  _prev: ModState,
  formData: FormData,
): Promise<ModState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const resolution = str(formData, 'resolution');
  if (!isValidResolution(resolution)) return { error: 'Choose a valid resolution.' };

  try {
    const result = resolveReport(user, reportId, resolution as ReportResolution, getNow());
    if (result === null) return { error: 'That report no longer exists.' };
    if (!result.ok) return { error: result.error };

    // Suspending the lister's account is a deliberate account-level action.
    if (resolution === 'lister_suspended') {
      const report = getReport(reportId);
      if (report?.reportedListerId) {
        await getAuthProvider().setAccountStatus(report.reportedListerId, 'suspended');
      }
    }
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/dashboard/reports');
  revalidatePath('/search');
  return { ok: true, message: 'Report resolved.' };
}

/** Admin: issue a verification for a lister profile (I4 — admin review required). */
export async function issueVerificationAction(
  subjectId: string,
  _prev: ModState,
  formData: FormData,
): Promise<ModState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  const type = str(formData, 'type');
  if (!(ISSUABLE_VERIFICATIONS as string[]).includes(type)) {
    return { error: 'Choose a valid verification type.' };
  }
  try {
    issueVerification(
      user,
      subjectId,
      type as VerificationType,
      str(formData, 'summary'),
      getNow(),
    );
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/dashboard/admin');
  revalidatePath('/search');
  return { ok: true, message: 'Verification issued.' };
}

/** Admin: revoke a verification (I3 — badge disappears from public output). */
export async function revokeVerificationAction(
  recordId: string,
  _prev: ModState,
  _formData: FormData,
): Promise<ModState> {
  const user = await getCurrentUser();
  if (!user) return { error: 'Your session expired. Please sign in again.' };
  try {
    const result = revokeVerification(user, recordId, getNow());
    if (result === null) return { error: 'That verification no longer exists.' };
    if (!result.ok) return { error: result.error };
  } catch (e) {
    if (e instanceof AuthorizationError) return { error: DENIED };
    throw e;
  }
  revalidatePath('/dashboard/admin');
  revalidatePath('/search');
  return { ok: true, message: 'Verification revoked.' };
}
