import { FilterBar } from "@/components/filter-bar";
import { ListingCard } from "@/components/listing-card";
import { getAreas, getListings } from "@/lib/data/listings";
import { parseFilters } from "@/lib/data/filters";
import { hasDatabase } from "@/lib/prisma";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [listings, areas] = await Promise.all([getListings(filters), getAreas()]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="border-b border-neutral-200 bg-gradient-to-br from-white via-emerald-50/30 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 leading-tight">
              Find your next home in Jos
            </h1>
            <p className="mt-4 text-lg text-neutral-600 max-w-2xl leading-relaxed">
              Browse verified listings across Plateau State. See photos, understand all costs, and contact landlords directly.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <FilterBar areas={areas} current={filters} />
        </div>

        {!hasDatabase && (
          <div className="mb-6 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800 border border-blue-200">
            <span className="font-semibold">Demo mode:</span> Showing sample listings. Connect a database (set{" "}
            <code className="font-mono bg-blue-100 px-1 rounded">DATABASE_URL</code>) and run the seed to use live data.
          </div>
        )}

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            {listings.length} {listings.length === 1 ? "property" : "properties"} available
          </h2>
        </div>

        {/* Results Grid */}
        {listings.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-neutral-200 p-12 text-center">
            <p className="text-neutral-600">No properties match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
