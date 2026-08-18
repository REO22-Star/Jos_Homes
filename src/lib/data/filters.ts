import { nairaToKobo } from "@/lib/money";
import { LISTING_TYPES } from "@/lib/labels";
import type { ListingFilters, ListingTypeVM } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

function str(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

/** Parse the page's (already-awaited) searchParams into typed, validated filters. */
export function parseFilters(sp: SearchParams): ListingFilters {
  const q = str(sp.q);
  const typeRaw = str(sp.type);
  const type = LISTING_TYPES.includes(typeRaw as ListingTypeVM)
    ? (typeRaw as ListingTypeVM)
    : undefined;
  const areaSlug = str(sp.area);
  const bedsRaw = Number(str(sp.beds));
  const bedrooms = Number.isFinite(bedsRaw) && bedsRaw > 0 ? bedsRaw : undefined;
  const maxRentRaw = Number(str(sp.maxRent));
  const maxRentKobo =
    Number.isFinite(maxRentRaw) && maxRentRaw > 0 ? nairaToKobo(maxRentRaw) : undefined;
  const minRentRaw = Number(str(sp.minRent));
  const minRentKobo =
    Number.isFinite(minRentRaw) && minRentRaw > 0 ? nairaToKobo(minRentRaw) : undefined;

  return { q, type, areaSlug, bedrooms, maxRentKobo, minRentKobo };
}
