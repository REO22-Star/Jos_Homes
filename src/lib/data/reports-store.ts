import type { ReportResolution, ReportStatus } from '@/lib/domain/reports';

/**
 * In-memory reports store (Milestone 5). The reporter is identified only by an
 * anonymous visitor id, which is NEVER exposed to the reported lister (I1).
 * Reports are visible to staff only.
 */
export interface Report {
  id: string;
  listingId: string;
  listingTitle: string;
  reportedListerId: string | null;
  /** PRIVATE anonymous id. Not personal data and never shown to the lister. */
  reporterVisitorId: string;
  reasonCode: string;
  details: string | null;
  status: ReportStatus;
  resolution: ReportResolution | null;
  assignedTo: string | null;
  createdAtMs: number;
  resolvedAtMs: number | null;
}

interface ReportsDB {
  reports: Report[];
  seq: number;
  seeded: boolean;
}

const globalRef = globalThis as unknown as { __joshomesReportsDB?: ReportsDB };

function db(): ReportsDB {
  const existing = globalRef.__joshomesReportsDB;
  if (existing) {
    if (!existing.seeded) seed(existing);
    return existing;
  }
  const created: ReportsDB = { reports: [], seq: 0, seeded: false };
  seed(created);
  globalRef.__joshomesReportsDB = created;
  return created;
}

export function pushReport(
  data: Omit<
    Report,
    'id' | 'status' | 'resolution' | 'assignedTo' | 'createdAtMs' | 'resolvedAtMs'
  >,
  atMs: number,
): Report {
  const store = db();
  store.seq += 1;
  const record: Report = {
    ...data,
    id: `rep-${store.seq}`,
    status: 'new',
    resolution: null,
    assignedTo: null,
    createdAtMs: atMs,
    resolvedAtMs: null,
  };
  store.reports.push(record);
  return record;
}

export function listReports(): Report[] {
  return [...db().reports].sort((a, b) => b.createdAtMs - a.createdAtMs);
}

export function openReportCount(): number {
  return db().reports.filter((r) => r.status === 'new' || r.status === 'reviewing').length;
}

export function getReport(id: string): Report | undefined {
  return db().reports.find((r) => r.id === id);
}

export function __resetReportsDB(): void {
  const store = db();
  store.reports = [];
  store.seq = 0;
  store.seeded = false;
  seed(store);
}

function seed(store: ReportsDB): void {
  store.seeded = true;
  store.seq = 1;
  store.reports = [
    {
      id: 'rep-1',
      listingId: 'l9',
      listingTitle: '2 bedroom flat in Anglo Jos',
      reportedListerId: null,
      reporterVisitorId: 'seed-visitor',
      reasonCode: 'Property appears taken',
      details: 'Called and was told it is already rented.',
      status: 'new',
      resolution: null,
      assignedTo: null,
      createdAtMs: Date.parse('2026-07-20T09:00:00.000Z'),
      resolvedAtMs: null,
    },
  ];
}
