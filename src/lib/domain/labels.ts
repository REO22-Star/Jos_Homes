import type { FurnishingState, ListerType, PropertyType, VerificationType } from './types';

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  self_contained: 'Self-contained',
  mini_flat: 'Mini flat',
  one_bedroom: '1 bedroom flat',
  two_bedroom: '2 bedroom flat',
  three_bedroom: '3 bedroom flat',
  duplex: 'Duplex',
};

export const FURNISHING_LABEL: Record<FurnishingState, string> = {
  unfurnished: 'Unfurnished',
  semi_furnished: 'Semi-furnished',
  furnished: 'Furnished',
};

/** Public-facing lister type wording (docs/CONTENT_AND_COPY.md). */
export const LISTER_TYPE_LABEL: Record<ListerType, string> = {
  landlord: 'Direct landlord',
  agent: 'Agent',
  caretaker: 'Caretaker',
  firm: 'Property firm',
  platform_in_house: 'JosHomes in-house agency',
};

/**
 * Precise verification badge wording. A badge states what was checked and is
 * never an ownership or safety guarantee (docs/ACCEPTANCE_TESTS.md I2).
 */
export const VERIFICATION_LABEL: Record<VerificationType, string> = {
  phone: 'Phone verified',
  identity_review: 'Identity reviewed',
  business_review: 'Business reviewed',
  professional_registration_review: 'Professional registration reviewed',
  property_access: 'Property access verified',
  landlord_authorization: 'Landlord authorization reviewed',
  platform_inspection: 'Platform-inspected property',
};

export const VERIFICATION_HELPER =
  'Verification shows what the platform checked. It is not a guarantee of ownership, conduct, or a successful transaction.';
