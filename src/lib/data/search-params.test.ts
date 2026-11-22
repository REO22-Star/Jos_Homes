import { describe, expect, it } from 'vitest';
import { countActiveFilters, parseSearchParams } from './search-params';

describe('countActiveFilters', () => {
  it('is zero for an unfiltered search', () => {
    expect(countActiveFilters({})).toBe(0);
  });

  it('counts each filter but not the sort order', () => {
    const params = parseSearchParams({
      area: 'rayfield',
      maxRent: '500000',
      furnished: 'true',
      sort: 'price_asc',
    });
    expect(countActiveFilters(params)).toBe(3);
  });

  it('counts a zero minimum rent as set', () => {
    expect(countActiveFilters(parseSearchParams({ minRent: '0' }))).toBe(1);
  });

  it('ignores empty form fields', () => {
    expect(countActiveFilters(parseSearchParams({ area: '', minRent: '', maxRent: ' ' }))).toBe(0);
  });
});
