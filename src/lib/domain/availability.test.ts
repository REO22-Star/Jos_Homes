import { describe, expect, it } from 'vitest';
import { contactActionsEnabled, isPubliclySearchable } from './availability';

describe('isPubliclySearchable', () => {
  it('includes available-type states when not stale-suppressed', () => {
    expect(isPubliclySearchable('available', 'fresh')).toBe(true);
    expect(isPubliclySearchable('inspection_ongoing', 'recent')).toBe(true);
    expect(isPubliclySearchable('application_pending', 'overdue')).toBe(true);
  });

  it('excludes taken, paused, under_review, and unavailable states', () => {
    expect(isPubliclySearchable('taken', 'fresh')).toBe(false);
    expect(isPubliclySearchable('paused', 'fresh')).toBe(false);
    expect(isPubliclySearchable('under_review', 'fresh')).toBe(false);
    expect(isPubliclySearchable('confirmation_overdue', 'overdue')).toBe(false);
  });

  it('excludes stale-suppressed listings even if otherwise available', () => {
    expect(isPubliclySearchable('available', 'suppressed')).toBe(false);
  });
});

describe('contactActionsEnabled', () => {
  it('disables contact for taken and under_review', () => {
    expect(contactActionsEnabled('taken')).toBe(false);
    expect(contactActionsEnabled('under_review')).toBe(false);
    expect(contactActionsEnabled('available')).toBe(true);
    expect(contactActionsEnabled('paused')).toBe(true);
  });
});
