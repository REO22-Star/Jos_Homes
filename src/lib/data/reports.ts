import type { AuthUser } from '@/lib/auth/types';
import { AuthorizationError, isStaff } from '@/lib/domain/authorization';
import {
  isValidReportReason,
  isValidResolution,
  type ReportResolution,
} from '@/lib/domain/reports';
import { placeUnderReview } from './authoring';
import { appendAudit } from './authoring-store';
import { getReport, listReports, pushReport, type Report } from './reports-store';

/**
 * Reports service. Creating a report NEVER changes the listing — that would let
 * a single unverified report take a listing down. Any action (under review,
 * suspend) is a deliberate staff resolution (E5). The reporter's anonymous id
 * is never surfaced to the reported lister (I1); reports are staff-only.
 */

export interface CreateReportInput {
  listingId: string;
  listingTitle: string;
  reportedListerId: string | null;
  reporterVisitorId: string;
  reasonCode: string;
  details?: string;
}

export function createReport(
  input: CreateReportInput,
  now: Date,
): { ok: true; report: Report } | { ok: false; error: string } {
  if (!isValidReportReason(input.reasonCode)) {
    return { ok: false, error: 'Choose a valid reason for the report.' };
  }
  const report = pushReport(
    {
      listingId: input.listingId,
      listingTitle: input.listingTitle,
      reportedListerId: input.reportedListerId,
      reporterVisitorId: input.reporterVisitorId,
      reasonCode: input.reasonCode,
      details: input.details?.trim() || null,
    },
    now.getTime(),
  );
  // The audit summary records the reason, never the reporter (J2/I1).
  appendAudit(
    {
      actorId: null,
      action: 'report.create',
      targetType: 'listing',
      targetId: input.listingId,
      summary: input.reasonCode,
    },
    now.toISOString(),
  );
  return { ok: true, report };
}

export function listReportsForStaff(user: AuthUser): Report[] {
  if (!isStaff(user.role)) throw new AuthorizationError();
  return listReports();
}

export function getReportForStaff(user: AuthUser, id: string): Report | null {
  if (!isStaff(user.role)) throw new AuthorizationError();
  return getReport(id) ?? null;
}

export function resolveReport(
  user: AuthUser,
  id: string,
  resolution: ReportResolution,
  now: Date,
): { ok: true } | { ok: false; error: string } | null {
  if (!isStaff(user.role)) throw new AuthorizationError();
  if (!isValidResolution(resolution)) return { ok: false, error: 'Choose a valid resolution.' };
  const report = getReport(id);
  if (!report) return null;

  // Deliberate side effect — never automatic on report creation (E5).
  if (resolution === 'placed_under_review') {
    placeUnderReview(user, report.listingId, now);
  }

  report.status = resolution === 'dismissed_no_issue' ? 'dismissed' : 'resolved';
  report.resolution = resolution;
  report.assignedTo = user.id;
  report.resolvedAtMs = now.getTime();
  appendAudit(
    {
      actorId: user.id,
      action: 'report.resolve',
      targetType: 'report',
      targetId: id,
      summary: resolution,
    },
    now.toISOString(),
  );
  return { ok: true };
}
