import type { PropertyType } from '@/lib/domain/types';
import type { SearchParams, SortKey } from './types';

const PROPERTY_TYPES: PropertyType[] = [
  'self_contained',
  'mini_flat',
  'one_bedroom',
  'two_bedroom',
  'three_bedroom',
  'duplex',
];
const SORT_KEYS: SortKey[] = ['relevance', 'newest', 'price_asc', 'price_desc'];

function toPositiveInt(value: string | undefined): number | undefined {
  // An empty field from a GET form arrives as "" — Number("") is 0, which
  // would silently filter to a maximum rent of zero.
  if (value === undefined || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

/** Accepts Next.js searchParams (string | string[] | undefined values). */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse URL query into a validated SearchParams. Unknown values are dropped. */
export function parseSearchParams(raw: RawSearchParams): SearchParams {
  const params: SearchParams = {};

  const area = first(raw.area);
  if (area) params.area = area;

  const type = first(raw.type);
  if (type && (PROPERTY_TYPES as string[]).includes(type)) params.type = type as PropertyType;

  const minRent = toPositiveInt(first(raw.minRent));
  if (minRent !== undefined) params.minRent = minRent;

  const maxRent = toPositiveInt(first(raw.maxRent));
  if (maxRent !== undefined) params.maxRent = maxRent;

  const beds = toPositiveInt(first(raw.beds));
  if (beds !== undefined) params.beds = beds;

  if (first(raw.furnished) === 'true') params.furnished = true;
  if (first(raw.directLandlord) === 'true') params.directLandlord = true;

  const sort = first(raw.sort);
  if (sort && (SORT_KEYS as string[]).includes(sort)) params.sort = sort as SortKey;

  return params;
}

/** Serialize SearchParams back into a query string (stable key order). */
export function toQueryString(params: SearchParams): string {
  const sp = new URLSearchParams();
  if (params.area) sp.set('area', params.area);
  if (params.type) sp.set('type', params.type);
  if (params.minRent !== undefined) sp.set('minRent', String(params.minRent));
  if (params.maxRent !== undefined) sp.set('maxRent', String(params.maxRent));
  if (params.beds !== undefined) sp.set('beds', String(params.beds));
  if (params.furnished) sp.set('furnished', 'true');
  if (params.directLandlord) sp.set('directLandlord', 'true');
  if (params.sort && params.sort !== 'relevance') sp.set('sort', params.sort);
  return sp.toString();
}

/**
 * How many filters narrow the results. Sort order is not a filter, so it is
 * not counted. Shown on the collapsed mobile filter toggle.
 */
export function countActiveFilters(params: SearchParams): number {
  return [
    params.area,
    params.type,
    params.minRent,
    params.maxRent,
    params.beds,
    params.furnished,
    params.directLandlord,
  ].filter((v) => v !== undefined && v !== false).length;
}
