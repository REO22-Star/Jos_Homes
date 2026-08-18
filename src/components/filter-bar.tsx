import { Search } from "lucide-react";
import { LISTING_TYPES, LISTING_TYPE_LABEL } from "@/lib/labels";
import type { AreaVM, ListingFilters } from "@/lib/data/types";
import { koboToNaira } from "@/lib/money";

/**
 * Plain GET form — no client JS required. Works on the cheapest phone and keeps
 * filter state in the URL (shareable + back-button friendly). Progressive
 * enhancement can be layered on later.
 */
export function FilterBar({
  areas,
  current,
}: {
  areas: AreaVM[];
  current: ListingFilters;
}) {
  const inputCls =
    "w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <form method="get" className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex-1 min-w-[180px]">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Search</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              name="q"
              defaultValue={current.q ?? ""}
              placeholder="Area, street, keyword…"
              className={`${inputCls} pl-8`}
            />
          </div>
        </label>

        <label className="min-w-[130px]">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Type</span>
          <select name="type" defaultValue={current.type ?? ""} className={inputCls}>
            <option value="">Any type</option>
            {LISTING_TYPES.map((t) => (
              <option key={t} value={t}>
                {LISTING_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[130px]">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Area</span>
          <select name="area" defaultValue={current.areaSlug ?? ""} className={inputCls}>
            <option value="">All of Jos</option>
            {areas.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[90px]">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Beds</span>
          <select name="beds" defaultValue={current.bedrooms ?? ""} className={inputCls}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>

        <label className="min-w-[120px]">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Max rent (₦/yr)</span>
          <input
            type="number"
            name="maxRent"
            min={0}
            step={50000}
            defaultValue={current.maxRentKobo ? koboToNaira(current.maxRentKobo) : ""}
            placeholder="e.g. 1000000"
            className={inputCls}
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
        >
          Search
        </button>
      </div>
    </form>
  );
}
