import type { InternalListing } from '@/lib/domain/internal-types';
import type { AvailabilityState, ListingWorkflowState } from '@/lib/domain/types';
import { nairaToMinor } from '@/lib/domain/money';

/**
 * Writable in-memory store for authored listings (Milestone 2).
 *
 * This is the development backend for the submission -> moderation -> publish
 * flow. It holds full internal records (including the private address) and is
 * only ever exposed publicly through `toPublicListing`, exactly like the seed
 * data. It is hung off `globalThis` because the Next.js server runtime can
 * evaluate a module more than once, which would otherwise drop writes between
 * requests (see the same fix in src/lib/auth/dev-provider.ts).
 *
 * When Supabase is configured these operations map to database writes governed
 * by the RLS policies in supabase/migrations/0003_rls.sql (see docs, D-022).
 */

export interface StatusHistoryEntry {
  id: string;
  atISO: string;
  actorId: string | null;
  changeType: string;
  previousWorkflowState: ListingWorkflowState | null;
  newWorkflowState: ListingWorkflowState | null;
  previousAvailabilityState: AvailabilityState | null;
  newAvailabilityState: AvailabilityState | null;
  reasonCode: string | null;
  note: string | null;
}

export interface AuditEntry {
  id: string;
  atISO: string;
  actorId: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string | null;
}

/**
 * An authored listing is an internal listing plus ownership and its immutable
 * history. `createdByProfileId` and `assignedListerId` drive authorization.
 */
export type AuthoredRecord = InternalListing & {
  createdByProfileId: string;
  assignedListerId: string;
  /** The lister's confirmation that they may advertise; required to submit. */
  authorizedToAdvertise: boolean;
  statusHistory: StatusHistoryEntry[];
};

interface AuthoringDB {
  listings: Map<string, AuthoredRecord>;
  audit: AuditEntry[];
  seq: number;
  seeded: boolean;
}

const globalRef = globalThis as unknown as { __joshomesAuthoringDB?: AuthoringDB };

function db(): AuthoringDB {
  const existing = globalRef.__joshomesAuthoringDB;
  if (existing) {
    if (!existing.seeded) seed(existing);
    return existing;
  }
  const created: AuthoringDB = { listings: new Map(), audit: [], seq: 0, seeded: false };
  seed(created);
  globalRef.__joshomesAuthoringDB = created;
  return created;
}

export function nextReferenceCode(): string {
  const store = db();
  store.seq += 1;
  // Offset past the seeded codes (JH-2001, JH-2002) to avoid collisions.
  return `JH-2${100 + store.seq}`;
}

export function getRecord(id: string): AuthoredRecord | undefined {
  return db().listings.get(id);
}

export function putRecord(record: AuthoredRecord): void {
  db().listings.set(record.id, record);
}

export function allRecords(): AuthoredRecord[] {
  return [...db().listings.values()];
}

/** Approved authored listings, for the public read union. */
export function approvedRecords(): AuthoredRecord[] {
  return allRecords().filter((r) => r.workflowState === 'approved');
}

export function recordsForLister(profileId: string): AuthoredRecord[] {
  return allRecords().filter(
    (r) => r.assignedListerId === profileId || r.createdByProfileId === profileId,
  );
}

export function reviewQueue(): AuthoredRecord[] {
  return allRecords().filter((r) => r.workflowState === 'submitted');
}

export function appendAudit(entry: Omit<AuditEntry, 'id' | 'atISO'>, atISO: string): void {
  const store = db();
  store.audit.push({ id: `audit-${store.audit.length + 1}`, atISO, ...entry });
}

export function auditForTarget(targetId: string): AuditEntry[] {
  return db().audit.filter((a) => a.targetId === targetId);
}

/** Searchable audit log (newest first). Matches action/target/summary text. */
export function listAudit(query?: string): AuditEntry[] {
  const all = [...db().audit].reverse();
  const q = query?.trim().toLowerCase();
  if (!q) return all;
  return all.filter((a) =>
    `${a.action} ${a.targetType} ${a.targetId ?? ''} ${a.summary ?? ''}`.toLowerCase().includes(q),
  );
}

/** Test helper: wipe and re-seed. */
export function __resetAuthoringDB(): void {
  const store = db();
  store.listings.clear();
  store.audit = [];
  store.seq = 0;
  store.seeded = false;
  seed(store);
}

// --- Seed -----------------------------------------------------------------

const GRACE = 'a0000000-0000-4000-8000-000000000001';
const DANIEL = 'a0000000-0000-4000-8000-000000000002';

function seed(store: AuthoringDB): void {
  store.seeded = true;
  // A draft owned by Grace so the lister dashboard shows work in progress.
  store.listings.set('draft-demo-grace', {
    id: 'draft-demo-grace',
    slug: 'draft-mini-flat-farin-gada',
    referenceCode: 'JH-2001',
    title: 'Draft: mini flat near Farin Gada',
    description:
      'Work-in-progress draft. Add the remaining details and submit for review when ready.',
    workflowState: 'draft',
    availabilityState: 'available',
    rentMinor: nairaToMinor(400_000),
    rentFrequency: 'annual',
    feeDisclosure: 'not_stated',
    availableFromISO: null,
    lastConfirmedAt: new Date(0),
    createdByProfileId: GRACE,
    assignedListerId: GRACE,
    authorizedToAdvertise: false,
    property: {
      id: 'prop-draft-grace',
      areaName: 'Farin Gada',
      areaSlug: 'farin-gada',
      publicLandmark: 'Near Farin Gada roundabout',
      approxLocationLabel: 'Farin Gada, northern Jos',
      privateAddressLine: '8 Draft Close, Farin Gada',
      privateAddressNotes: null,
      propertyType: 'mini_flat',
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      parkingSpaces: 1,
      furnishingState: 'unfurnished',
      waterSource: 'Borehole',
      electricityMeter: 'Prepaid',
      features: [],
      houseRules: [],
    },
    lister: {
      slug: 'grace-estates',
      displayName: 'Grace Estates (fictional)',
      listerType: 'agent',
      privatePhoneE164: '+2348000000001',
      verifications: [],
    },
    media: [],
    qualifiedViews7d: 0,
    inquiries7d: 0,
    sponsorshipLabel: null,
    statusHistory: [
      {
        id: 'h-draft-grace-1',
        atISO: '2026-07-19T08:00:00.000Z',
        actorId: GRACE,
        changeType: 'created',
        previousWorkflowState: null,
        newWorkflowState: 'draft',
        previousAvailabilityState: null,
        newAvailabilityState: 'available',
        reasonCode: null,
        note: null,
      },
    ],
  });

  // A submitted listing owned by Daniel so the moderator queue is non-empty.
  store.listings.set('submitted-demo-daniel', {
    id: 'submitted-demo-daniel',
    slug: 'submitted-2-bed-tudun-wada',
    referenceCode: 'JH-2002',
    title: 'Submitted: 2 bedroom flat in Tudun Wada',
    description:
      'A tidy 2 bedroom flat awaiting moderation, with tiled floors and a fenced compound.',
    workflowState: 'submitted',
    availabilityState: 'available',
    rentMinor: nairaToMinor(720_000),
    rentFrequency: 'annual',
    feeDisclosure: 'fees_listed',
    agencyMinor: nairaToMinor(72_000),
    availableFromISO: '2026-08-15',
    lastConfirmedAt: new Date(0),
    createdByProfileId: DANIEL,
    assignedListerId: DANIEL,
    authorizedToAdvertise: true,
    property: {
      id: 'prop-submitted-daniel',
      areaName: 'Tudun Wada',
      areaSlug: 'tudun-wada',
      publicLandmark: 'Near Tudun Wada junction',
      approxLocationLabel: 'Tudun Wada, central Jos',
      privateAddressLine: '3 Review Street, Tudun Wada',
      privateAddressNotes: null,
      propertyType: 'two_bedroom',
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      parkingSpaces: 1,
      furnishingState: 'unfurnished',
      waterSource: 'Borehole',
      electricityMeter: 'Prepaid',
      features: ['Tiled floors', 'Fenced compound'],
      houseRules: [],
    },
    lister: {
      slug: 'daniel-danjuma',
      displayName: 'Daniel Danjuma (fictional)',
      listerType: 'landlord',
      privatePhoneE164: '+2348000000002',
      verifications: [],
    },
    media: [],
    qualifiedViews7d: 0,
    inquiries7d: 0,
    sponsorshipLabel: null,
    statusHistory: [
      {
        id: 'h-submitted-daniel-1',
        atISO: '2026-07-19T09:00:00.000Z',
        actorId: DANIEL,
        changeType: 'submitted',
        previousWorkflowState: 'draft',
        newWorkflowState: 'submitted',
        previousAvailabilityState: null,
        newAvailabilityState: null,
        reasonCode: null,
        note: null,
      },
    ],
  });
}
