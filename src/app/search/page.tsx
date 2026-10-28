import type { Metadata } from 'next';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SaveSearchForm } from '@/components/search/SaveSearchForm';
import { getListingRepository } from '@/lib/data';
import { parseSearchParams, type RawSearchParams } from '@/lib/data/search-params';
import { areaBySlug } from '@/lib/data/areas';
import { getNow } from '@/lib/now';
import styles from './search.module.css';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}): Promise<Metadata> {
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const areaName = params.area ? areaBySlug(params.area)?.name : undefined;

  if (areaName) {
    return {
      title: `Apartments in ${areaName}, Jos | Search Rentals | JosHomes`,
      description: `Find available homes for rent in ${areaName}, Jos. Filter by price, bedrooms, property type. Fresh listings verified weekly.`,
    };
  }

  return {
    title: 'Search Rental Vacancies in Jos | JosHomes',
    description: 'Search current, recently confirmed rental vacancies across Jos, Plateau State. Filter by area, price, bedrooms, and property type.',
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const now = getNow();
  const raw = await searchParams;
  const params = parseSearchParams(raw);
  const results = await getListingRepository().searchAvailable(params, now);

  const areaName = params.area ? areaBySlug(params.area)?.name : undefined;
  const heading = areaName ? `Available homes in ${areaName}` : 'Available homes in Jos';

  return (
    <div className="container section">
      <header className={styles.head}>
        <h1>{heading}</h1>
        <p className="muted">
          {results.length} {results.length === 1 ? 'listing' : 'listings'} match your filters.
          Taken, paused, and unconfirmed listings are not shown.
        </p>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <SaveSearchForm params={params} />
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Search filters">
          <SearchFilters params={params} />
        </aside>

        <section className={styles.results} aria-label="Search results" aria-live="polite">
          {results.length > 0 ? (
            <>
              <ListingGrid listings={results} />
              <p className={styles.sponsoredNote}>
                Sponsored listings are clearly labelled and shown alongside organic results, never
                in place of them.
              </p>
            </>
          ) : (
            <EmptyState
              title="No current listings match these filters."
              description="Try a wider area or budget, or save the search for future matches."
            >
              <ButtonLink href="/search" variant="secondary">
                Clear filters
              </ButtonLink>
              <Link href="/list-a-property" className={styles.altLink}>
                List a vacancy instead
              </Link>
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}
