import { describe, expect, it } from 'vitest';
import {
  listingDraftSchema,
  listingSubmissionSchema,
  missingForSubmission,
  toFieldErrors,
} from './listing-input';

const validSubmission = {
  title: 'Bright 2 bedroom flat in Rayfield',
  description: 'A well-kept flat with steady water and prepaid metering, tiled throughout.',
  areaSlug: 'rayfield',
  propertyType: 'two_bedroom',
  privateAddressLine: '12 Fictional Close, Rayfield',
  rentNaira: 850000,
  rentFrequency: 'annual',
  feeDisclosure: 'fees_listed',
  availableFrom: '2026-08-01',
  contactPhone: '+2348000000001',
  authorizedToAdvertise: true,
};

describe('listingDraftSchema (lenient)', () => {
  it('accepts an empty draft', () => {
    expect(listingDraftSchema.safeParse({}).success).toBe(true);
  });

  it('still rejects malformed values that are present', () => {
    expect(listingDraftSchema.safeParse({ propertyType: 'castle' }).success).toBe(false);
    expect(listingDraftSchema.safeParse({ rentNaira: -5 }).success).toBe(false);
  });
});

describe('listingSubmissionSchema (strict, D2)', () => {
  it('accepts a complete submission', () => {
    const result = listingSubmissionSchema.safeParse(validSubmission);
    expect(result.success).toBe(true);
  });

  it('requires rent, area, address, availability, disclosure, and authorization', () => {
    const missing = missingForSubmission({ title: 'Too short' });
    expect(missing.length).toBeGreaterThan(0);
    // A couple of specific, actionable messages are present.
    const joined = missing.join(' | ');
    expect(joined).toMatch(/yearly rent/i);
    expect(joined).toMatch(/private address/i);
    expect(joined).toMatch(/authorized to advertise/i);
  });

  it('rejects submitting with an unstated fee disclosure', () => {
    const result = listingSubmissionSchema.safeParse({
      ...validSubmission,
      feeDisclosure: 'not_stated',
    });
    expect(result.success).toBe(false);
  });

  it('requires the authorization box to be ticked', () => {
    const result = listingSubmissionSchema.safeParse({
      ...validSubmission,
      authorizedToAdvertise: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error).authorizedToAdvertise).toMatch(/authorized/i);
    }
  });

  it('reports no missing requirements for a complete submission', () => {
    expect(missingForSubmission(validSubmission)).toEqual([]);
  });
});
