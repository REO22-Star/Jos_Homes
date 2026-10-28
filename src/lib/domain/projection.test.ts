import { describe, expect, it } from 'vitest';
import { toPublicListing } from './projection';
import type { InternalListing } from './internal-types';
import { nairaToMinor } from './money';

const now = new Date('2026-07-18T12:00:00.000Z');

function makeInternal(overrides: Partial<InternalListing> = {}): InternalListing {
  return {
    id: 'l1',
    slug: 'sample-listing',
    referenceCode: 'JH-0001',
    title: 'Sample listing',
    description: 'A description.',
    workflowState: 'approved',
    availabilityState: 'available',
    rentMinor: nairaToMinor(850_000),
    rentFrequency: 'annual',
    feeDisclosure: 'fees_listed',
    agencyMinor: nairaToMinor(85_000),
    availableFromISO: '2026-08-01',
    lastConfirmedAt: new Date('2026-07-18T10:00:00.000Z'),
    property: {
      id: 'p1',
      areaName: 'Rayfield',
      areaSlug: 'rayfield',
      publicLandmark: 'Near Rayfield Resort',
      approxLocationLabel: 'Rayfield area, southern Jos',
      privateAddressLine: '12 Secret Close, Rayfield GRA',
      privateAddressNotes: 'Blue gate, ask for the caretaker',
      propertyType: 'two_bedroom',
      bedrooms: 2,
      bathrooms: 2,
      toilets: 2,
      parkingSpaces: 2,
      furnishingState: 'unfurnished',
      waterSource: 'Borehole',
      electricityMeter: 'Prepaid',
      features: ['Fenced compound'],
      houseRules: ['No commercial use'],
    },
    lister: {
      slug: 'grace-estates',
      displayName: 'Grace Estates',
      listerType: 'agent',
      privatePhoneE164: '+2348000000001',
      verifications: [
        {
          type: 'phone',
          status: 'active',
          expiresAtISO: null,
          revokedAtISO: null,
          evidencePath: 'evidence/phone/1',
        },
        {
          type: 'property_access',
          status: 'active',
          expiresAtISO: null,
          revokedAtISO: null,
          evidencePath: 'evidence/access/1',
        },
        {
          type: 'identity_review',
          status: 'active',
          expiresAtISO: '2020-01-01',
          revokedAtISO: null,
          evidencePath: null,
        },
        {
          type: 'business_review',
          status: 'active',
          expiresAtISO: null,
          revokedAtISO: '2026-01-01',
          evidencePath: null,
        },
        {
          type: 'landlord_authorization',
          status: 'pending',
          expiresAtISO: null,
          revokedAtISO: null,
          evidencePath: null,
        },
      ],
    },
    media: [
      {
        id: 'm1',
        kind: 'image',
        placeholderHue: 200,
        alt: 'Living room',
        moderationState: 'approved',
      },
      {
        id: 'm2',
        kind: 'image',
        placeholderHue: 40,
        alt: 'Pending shot',
        moderationState: 'pending',
      },
      {
        id: 'm3',
        kind: 'image',
        placeholderHue: 90,
        alt: 'Rejected shot',
        moderationState: 'rejected',
      },
    ],
    qualifiedViews7d: 24,
    inquiries7d: 6,
    sponsorshipLabel: null,
    ...overrides,
  };
}

describe('toPublicListing privacy boundary', () => {
  it('never exposes the private address anywhere in the public payload', () => {
    const pub = toPublicListing(makeInternal(), now);
    const serialized = JSON.stringify(pub);
    expect(serialized).not.toContain('Secret Close');
    expect(serialized).not.toContain('Blue gate');
    expect(serialized).not.toContain('+2348000000001');
    expect(serialized).not.toContain('evidence/');
    // No private keys leak onto the projected objects.
    expect(pub).not.toHaveProperty('privateAddressLine');
    expect(pub.lister).not.toHaveProperty('privatePhoneE164');
  });

  it('returns only approved media', () => {
    const pub = toPublicListing(makeInternal(), now);
    expect(pub.media.map((m) => m.id)).toEqual(['m1']);
  });

  it('returns only valid (active, non-expired, non-revoked) badges', () => {
    const pub = toPublicListing(makeInternal(), now);
    // phone + property_access are valid; identity (expired), business (revoked),
    // landlord_authorization (pending) are excluded.
    expect(pub.lister.badges.sort()).toEqual(['phone', 'property_access']);
  });

  it('computes freshness and the estimated move-in total', () => {
    const pub = toPublicListing(makeInternal(), now);
    expect(pub.freshness.status).toBe('fresh');
    expect(pub.fees.estimatedMoveInTotalMinor).toBe(nairaToMinor(935_000));
  });

  it('projects a sponsorship label when present', () => {
    const pub = toPublicListing(makeInternal({ sponsorshipLabel: 'Sponsored listing' }), now);
    expect(pub.sponsorship).toEqual({ label: 'Sponsored listing' });
  });
});
