import { z } from 'zod';

/**
 * Server-side validation for lister-supplied listing data.
 *
 * Two schemas:
 *  - `listingDraftSchema` is lenient: a draft can be saved half-complete, but
 *    any value that IS present must be well-formed.
 *  - `listingSubmissionSchema` is strict: it enforces every field required to
 *    submit for review (docs/PRODUCT_REQUIREMENTS.md §13, acceptance D2).
 *
 * Money is entered in whole naira here and converted to integer minor units in
 * the service. Area membership is checked in the service against the controlled
 * area list, keeping this module free of data-layer imports.
 */

export const PROPERTY_TYPES = [
  'self_contained',
  'mini_flat',
  'one_bedroom',
  'two_bedroom',
  'three_bedroom',
  'duplex',
] as const;

export const RENT_FREQUENCIES = ['annual', 'monthly'] as const;
export const FURNISHING_STATES = ['unfurnished', 'semi_furnished', 'furnished'] as const;
// A submission must make an explicit disclosure: either "no additional fees" or
// a listed set. "not_stated" is not an acceptable submission choice.
export const SUBMISSION_DISCLOSURES = ['none_known', 'fees_listed'] as const;

const naira = z.coerce
  .number({ error: 'Enter an amount as a number.' })
  .int('Enter a whole naira amount.')
  .min(0, 'Amounts cannot be negative.');

const optionalNaira = naira.optional();

/** Fields shared by draft and submission. All optional at the draft stage. */
const baseShape = {
  title: z.string().trim().max(140).optional(),
  description: z.string().trim().max(4000).optional(),
  areaSlug: z.string().trim().optional(),
  propertyType: z.enum(PROPERTY_TYPES).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  toilets: z.coerce.number().int().min(0).max(20).optional(),
  parkingSpaces: z.coerce.number().int().min(0).max(20).optional(),
  furnishingState: z.enum(FURNISHING_STATES).optional(),

  privateAddressLine: z.string().trim().max(300).optional(),
  privateAddressNotes: z.string().trim().max(500).optional(),
  publicLandmark: z.string().trim().max(200).optional(),
  approxLocationLabel: z.string().trim().max(200).optional(),
  waterSource: z.string().trim().max(120).optional(),
  electricityMeter: z.string().trim().max(120).optional(),
  features: z.array(z.string().trim().max(60)).max(30).optional(),
  houseRules: z.array(z.string().trim().max(120)).max(30).optional(),

  rentNaira: optionalNaira,
  rentFrequency: z.enum(RENT_FREQUENCIES).optional(),
  feeDisclosure: z.enum(['none_known', 'fees_listed', 'not_stated']).optional(),
  agencyNaira: optionalNaira,
  legalNaira: optionalNaira,
  cautionNaira: optionalNaira,
  serviceNaira: optionalNaira,
  otherNaira: optionalNaira,
  otherLabel: z.string().trim().max(80).optional(),

  availableFrom: z.string().trim().optional(),
  contactPhone: z.string().trim().max(40).optional(),
  authorizedToAdvertise: z.boolean().optional(),
};

export const listingDraftSchema = z.object(baseShape);
export type ListingDraftInput = z.infer<typeof listingDraftSchema>;

/**
 * Every requirement that must hold before a listing can be submitted. Each
 * required field sets a base `error` so a MISSING value still yields an
 * actionable message (not Zod's default "expected string, received undefined").
 */
export const listingSubmissionSchema = z.object({
  ...baseShape,
  title: z
    .string({ error: 'Enter a descriptive title of at least 6 characters.' })
    .trim()
    .min(6, 'Enter a descriptive title of at least 6 characters.')
    .max(140),
  description: z
    .string({ error: 'Describe the property in at least 20 characters.' })
    .trim()
    .min(20, 'Describe the property in at least 20 characters.')
    .max(4000),
  areaSlug: z
    .string({ error: 'Select an area that the public can see.' })
    .trim()
    .min(1, 'Select an area that the public can see.'),
  propertyType: z.enum(PROPERTY_TYPES, { error: 'Choose a property type.' }),
  privateAddressLine: z
    .string({ error: 'Enter the private address. It will not appear on the public listing.' })
    .trim()
    .min(4, 'Enter the private address. It will not appear on the public listing.'),
  rentNaira: z.coerce
    .number({ error: 'Enter the yearly rent as a number greater than zero.' })
    .int('Enter the yearly rent as a whole number.')
    .min(1, 'Enter the yearly rent as a number greater than zero.'),
  rentFrequency: z.enum(RENT_FREQUENCIES, { error: 'Choose how often the rent is paid.' }),
  feeDisclosure: z.enum(SUBMISSION_DISCLOSURES, {
    error: 'State whether any additional fees apply.',
  }),
  availableFrom: z
    .string({ error: 'Enter the earliest move-in date.' })
    .trim()
    .min(1, 'Enter the earliest move-in date.'),
  contactPhone: z
    .string({ error: 'Enter a contact phone number for inquiries.' })
    .trim()
    .min(7, 'Enter a contact phone number for inquiries.'),
  authorizedToAdvertise: z.literal(true, {
    error: 'Confirm that you are authorized to advertise this property.',
  }),
});

export type ListingSubmissionInput = z.infer<typeof listingSubmissionSchema>;

export type FieldErrors = Record<string, string>;

/** Flatten a Zod error into a { field: message } map for form display. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Human-readable list of what still blocks submission (for a UI checklist). */
export function missingForSubmission(input: unknown): string[] {
  const result = listingSubmissionSchema.safeParse(input);
  if (result.success) return [];
  return Object.values(toFieldErrors(result.error));
}
