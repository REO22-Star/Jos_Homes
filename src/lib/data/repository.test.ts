import { describe, expect, it } from 'vitest';
import { memoryListingRepository as repo } from './memory-repository';
import { parseSearchParams, toQueryString } from './search-params';

const now = new Date('2026-07-18T12:00:00.000Z');

describe('searchAvailable exclusions (acceptance A3, E3)', () => {
  it('excludes taken, paused, overdue, under-review, stale-suppressed, and draft listings', async () => {
    const slugs = (await repo.searchAvailable({}, now)).map((l) => l.slug);
    expect(slugs).not.toContain('taken-2-bedroom-bukuru');
    expect(slugs).not.toContain('paused-mini-flat-dadin-kowa');
    expect(slugs).not.toContain('overdue-2-bedroom-anglo-jos');
    expect(slugs).not.toContain('under-review-flat-anglo-jos');
    expect(slugs).not.toContain('stale-self-contained-rukuba-road');
    expect(slugs).not.toContain('draft-hidden-listing');
  });

  it('includes ordinary available and pending/inspection listings', async () => {
    const slugs = (await repo.searchAvailable({}, now)).map((l) => l.slug);
    expect(slugs).toContain('bright-2-bedroom-rayfield');
    expect(slugs).toContain('self-contained-farin-gada');
    expect(slugs).toContain('furnished-mini-flat-tudun-wada');
    expect(slugs).toContain('compact-self-contained-kabong');
  });

  it('never leaks a private address in any search result (acceptance A5)', async () => {
    const serialized = JSON.stringify(await repo.searchAvailable({}, now));
    expect(serialized).not.toContain('Fictional Close');
    expect(serialized).not.toContain('Fictional Lane');
    expect(serialized).not.toContain('privateAddress');
    expect(serialized).not.toMatch(/\+234800000000\d/);
  });
});

describe('searchAvailable filters', () => {
  it('filters by area', async () => {
    const results = await repo.searchAvailable({ area: 'rayfield' }, now);
    expect(results.every((l) => l.area.slug === 'rayfield')).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('filters by price band', async () => {
    const results = await repo.searchAvailable({ maxRent: 300_000 }, now);
    expect(results.every((l) => (l.fees.lines[0]?.amountMinor ?? 0) / 100 <= 300_000)).toBe(true);
  });

  it('filters by minimum bedrooms', async () => {
    const results = await repo.searchAvailable({ beds: 3 }, now);
    expect(results.every((l) => (l.bedrooms ?? 0) >= 3)).toBe(true);
  });

  it('filters by direct landlord only', async () => {
    const results = await repo.searchAvailable({ directLandlord: true }, now);
    expect(results.every((l) => l.lister.listerType === 'landlord')).toBe(true);
  });

  it('sorts sponsored listings first under relevance', async () => {
    const results = await repo.searchAvailable({ sort: 'relevance' }, now);
    expect(results[0]?.sponsorship).not.toBeNull();
  });
});

describe('getBySlug', () => {
  it('returns null for an unapproved draft (unapproved never public)', async () => {
    expect(await repo.getBySlug('draft-hidden-listing', now)).toBeNull();
  });

  it('returns a taken listing so old links still resolve to a taken page', async () => {
    const taken = await repo.getBySlug('taken-2-bedroom-bukuru', now);
    expect(taken?.availabilityState).toBe('taken');
  });

  it('returns null for an unknown slug', async () => {
    expect(await repo.getBySlug('does-not-exist', now)).toBeNull();
  });
});

describe('getSimilar', () => {
  it('excludes the listing itself and returns available alternatives', async () => {
    const taken = (await repo.getBySlug('taken-2-bedroom-bukuru', now))!;
    const similar = await repo.getSimilar(taken, now);
    expect(similar.every((l) => l.id !== taken.id)).toBe(true);
    expect(similar.length).toBeGreaterThan(0);
  });
});

describe('countAvailable', () => {
  it('counts only searchable listings', async () => {
    expect(await repo.countAvailable(now)).toBe((await repo.searchAvailable({}, now)).length);
  });
});

describe('search param round-trip (acceptance A2)', () => {
  it('parses and re-serializes filters stably', () => {
    const raw = {
      area: 'rayfield',
      type: 'two_bedroom',
      minRent: '300000',
      beds: '2',
      sort: 'price_asc',
    };
    const parsed = parseSearchParams(raw);
    expect(parsed).toEqual({
      area: 'rayfield',
      type: 'two_bedroom',
      minRent: 300_000,
      beds: 2,
      sort: 'price_asc',
    });
    const qs = toQueryString(parsed);
    expect(parseSearchParams(Object.fromEntries(new URLSearchParams(qs)))).toEqual(parsed);
  });

  it('drops unknown or invalid values', () => {
    const parsed = parseSearchParams({ type: 'castle', sort: 'random', minRent: 'abc' });
    expect(parsed).toEqual({});
  });

  it('treats empty form fields as unset, not as zero', () => {
    // A GET form submits untouched fields as "area=&type=&minRent=&maxRent=&beds=".
    const parsed = parseSearchParams({ area: '', type: '', minRent: '', maxRent: ' ', beds: '' });
    expect(parsed).toEqual({});
  });
});
