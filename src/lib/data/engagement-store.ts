import { DEFAULT_VIEW_CONFIG, type ViewConfig } from '@/lib/domain/config';
import type { InquiryType } from '@/lib/domain/types';

/**
 * In-memory store for engagement events (Milestone 4): qualified views,
 * inquiries, and inspection requests. Hung off `globalThis` like the other dev
 * backends. In a configured environment these map to the listing_view_events,
 * inquiries, inspection_requests, and listing_metrics_daily tables.
 */

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface ViewEvent {
  listingId: string;
  viewerKey: string;
  atMs: number;
}

interface InquiryEvent {
  id: string;
  listingId: string;
  type: InquiryType;
  atMs: number;
}

export type InspectionStatus =
  'new' | 'acknowledged' | 'scheduled' | 'completed' | 'cancelled' | 'spam';

export interface InspectionRequest {
  id: string;
  listingId: string;
  listingTitle: string;
  /** Profile id of the lister who manages the listing; null for seed listings. */
  assignedListerId: string | null;
  requesterName: string;
  requesterPhone: string;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  atMs: number;
  status: InspectionStatus;
}

interface EngagementDB {
  views: ViewEvent[];
  inquiries: InquiryEvent[];
  inspections: InspectionRequest[];
  seq: number;
}

const globalRef = globalThis as unknown as { __joshomesEngagementDB?: EngagementDB };

function db(): EngagementDB {
  return (globalRef.__joshomesEngagementDB ??= {
    views: [],
    inquiries: [],
    inspections: [],
    seq: 0,
  });
}

/**
 * Record a qualified view unless the same visitor already has one for this
 * listing within the dedupe window. Returns true only when a NEW view is
 * counted (acceptance F3).
 */
export function recordViewDeduped(
  listingId: string,
  viewerKey: string,
  now: Date,
  config: ViewConfig = DEFAULT_VIEW_CONFIG,
): boolean {
  const store = db();
  const windowStart = now.getTime() - config.dedupeHours * MS_PER_HOUR;
  const already = store.views.some(
    (v) => v.listingId === listingId && v.viewerKey === viewerKey && v.atMs >= windowStart,
  );
  if (already) return false;
  store.views.push({ listingId, viewerKey, atMs: now.getTime() });
  return true;
}

export function pushInquiry(listingId: string, type: InquiryType, now: Date): void {
  const store = db();
  store.seq += 1;
  store.inquiries.push({ id: `inq-${store.seq}`, listingId, type, atMs: now.getTime() });
}

export function pushInspection(
  data: Omit<InspectionRequest, 'id' | 'atMs' | 'status'>,
  now: Date,
): InspectionRequest {
  const store = db();
  store.seq += 1;
  const record: InspectionRequest = {
    ...data,
    id: `insp-${store.seq}`,
    atMs: now.getTime(),
    status: 'new',
  };
  store.inspections.push(record);
  return record;
}

function countInWindow(times: number[], now: Date, days: number): number {
  const start = now.getTime() - days * MS_PER_DAY;
  return times.filter((t) => t >= start).length;
}

export function viewsInWindow(listingId: string, now: Date, days = 7): number {
  return countInWindow(
    db()
      .views.filter((v) => v.listingId === listingId)
      .map((v) => v.atMs),
    now,
    days,
  );
}

export function inquiriesInWindow(listingId: string, now: Date, days = 7): number {
  return countInWindow(
    db()
      .inquiries.filter((i) => i.listingId === listingId)
      .map((i) => i.atMs),
    now,
    days,
  );
}

export function inspectionsForLister(listerId: string): InspectionRequest[] {
  return db()
    .inspections.filter((r) => r.assignedListerId === listerId)
    .sort((a, b) => b.atMs - a.atMs);
}

export function getInspection(id: string): InspectionRequest | undefined {
  return db().inspections.find((r) => r.id === id);
}

/** Test helper. */
export function __resetEngagementDB(): void {
  const store = db();
  store.views = [];
  store.inquiries = [];
  store.inspections = [];
  store.seq = 0;
}
