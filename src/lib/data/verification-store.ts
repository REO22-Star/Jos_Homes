import type { VerificationType } from '@/lib/domain/types';

/**
 * In-memory verification records (Milestone 5). Each records exactly what was
 * checked about a lister profile. `evidencePath` is a PRIVATE pointer that is
 * never included in any public projection (H4/J3).
 */
export interface VerificationRecord {
  id: string;
  subjectId: string; // lister profile id
  type: VerificationType;
  status: 'pending' | 'active' | 'revoked';
  evidencePath: string | null;
  evidenceSummary: string | null;
  reviewedBy: string | null;
  issuedAtISO: string | null;
  expiresAtISO: string | null;
  revokedAtISO: string | null;
  createdAtMs: number;
}

interface VerificationDB {
  records: VerificationRecord[];
  seq: number;
  seeded: boolean;
}

const globalRef = globalThis as unknown as { __joshomesVerificationDB?: VerificationDB };
const GRACE = 'a0000000-0000-4000-8000-000000000001';

function db(): VerificationDB {
  const existing = globalRef.__joshomesVerificationDB;
  if (existing) {
    if (!existing.seeded) seed(existing);
    return existing;
  }
  const created: VerificationDB = { records: [], seq: 0, seeded: false };
  seed(created);
  globalRef.__joshomesVerificationDB = created;
  return created;
}

export function pushVerification(
  data: Omit<VerificationRecord, 'id' | 'createdAtMs'>,
  atMs: number,
): VerificationRecord {
  const store = db();
  store.seq += 1;
  const record: VerificationRecord = { ...data, id: `ver-${store.seq}`, createdAtMs: atMs };
  store.records.push(record);
  return record;
}

export function listForSubject(subjectId: string): VerificationRecord[] {
  return db().records.filter((r) => r.subjectId === subjectId);
}

export function getVerification(id: string): VerificationRecord | undefined {
  return db().records.find((r) => r.id === id);
}

export function __resetVerificationDB(): void {
  const store = db();
  store.records = [];
  store.seq = 0;
  store.seeded = false;
  seed(store);
}

function seed(store: VerificationDB): void {
  store.seeded = true;
  store.seq = 2;
  const active = (type: VerificationType, id: string): VerificationRecord => ({
    id,
    subjectId: GRACE,
    type,
    status: 'active',
    evidencePath: `private/evidence/${type}`,
    evidenceSummary: 'Reviewed by the operating team.',
    reviewedBy: 'a0000000-0000-4000-8000-000000000008',
    issuedAtISO: '2026-07-01T00:00:00.000Z',
    expiresAtISO: null,
    revokedAtISO: null,
    createdAtMs: Date.parse('2026-07-01T00:00:00.000Z'),
  });
  store.records = [active('phone', 'ver-1'), active('property_access', 'ver-2')];
}
