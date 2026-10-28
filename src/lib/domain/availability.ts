import { SEARCHABLE_AVAILABILITY_STATES } from './config';
import type { AvailabilityState, FreshnessStatus } from './types';

/** Availability label + helper copy, verbatim from docs/CONTENT_AND_COPY.md. */
export const AVAILABILITY_COPY: Record<
  AvailabilityState,
  { label: string; helper: string; tone: 'positive' | 'neutral' | 'caution' | 'closed' }
> = {
  available: {
    label: 'Available',
    helper: 'The lister recently confirmed that this property is still available.',
    tone: 'positive',
  },
  inspection_ongoing: {
    label: 'Inspections ongoing',
    helper: 'The property is still open, and inspections are being arranged.',
    tone: 'positive',
  },
  application_pending: {
    label: 'Application pending',
    helper: 'Someone is being considered, but the property has not been confirmed as taken.',
    tone: 'neutral',
  },
  taken: {
    label: 'Taken',
    helper: 'This property is no longer available. Explore similar current listings below.',
    tone: 'closed',
  },
  paused: {
    label: 'Listing paused',
    helper: 'The lister has temporarily stopped new inquiries.',
    tone: 'neutral',
  },
  confirmation_overdue: {
    label: 'Availability needs confirmation',
    helper:
      'The lister has not reconfirmed this vacancy recently. Contact with caution or explore fresher listings.',
    tone: 'caution',
  },
  under_review: {
    label: 'Listing under review',
    helper: 'New inquiries are temporarily limited while the platform reviews this listing.',
    tone: 'caution',
  },
};

/**
 * Whether a listing appears in ordinary public "available" search.
 *
 * A listing is searchable only when its availability state is one of the
 * searchable states AND its confirmation is not stale-suppressed
 * (docs/ACCEPTANCE_TESTS.md A3, E3).
 */
export function isPubliclySearchable(
  availabilityState: AvailabilityState,
  freshnessStatus: FreshnessStatus,
): boolean {
  const stateOk = (SEARCHABLE_AVAILABILITY_STATES as readonly AvailabilityState[]).includes(
    availabilityState,
  );
  return stateOk && freshnessStatus !== 'suppressed';
}

/** Contact actions are meaningful only while a listing is genuinely open. */
export function contactActionsEnabled(availabilityState: AvailabilityState): boolean {
  return availabilityState !== 'taken' && availabilityState !== 'under_review';
}
