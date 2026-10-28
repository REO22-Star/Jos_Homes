import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AREAS } from '@/lib/data/areas';
import { getListingRepository } from '@/lib/data';
import { PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import { formatNaira, nairaToMinor } from '@/lib/domain/money';
import type { PropertyType } from '@/lib/domain/types';
import { getNow } from '@/lib/now';
import { siteConfig } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Houses for rent in Jos, Plateau State | JosHomes',
  description:
    'Find homes for rent in Jos that listers have recently confirmed are still available. Search by area, budget and type of home, see the expected move-in cost, and contact the lister directly.',
};

/** Whole-naira upper bounds offered in the home search form. */
const MAX_RENT_OPTIONS = [300_000, 500_000, 1_000_000, 2_000_000];

export default async function HomePage() {
  const now = getNow();
  const repo = getListingRepository();
  const [featured, available] = await Promise.all([
    repo.getFeatured(now, 6),
    repo.countAvailable(now),
  ]);

  return (
    <>
      <section className={`container ${styles.find}`}>
        <h1 className={styles.title}>{siteConfig.tagline}</h1>
        <p className={styles.lead}>
          Every listing shows when the lister last confirmed it is still vacant, and what you should
          expect to pay to move in.
        </p>

        <form action="/search" method="get" className={styles.search}>
          <div>
            <label htmlFor="home-area" className={styles.label}>
              Area
            </label>
            <select id="home-area" name="area" className={styles.select} defaultValue="">
              <option value="">Anywhere in Jos</option>
              {AREAS.map((area) => (
                <option key={area.slug} value={area.slug}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="home-type" className={styles.label}>
              Type of home
            </label>
            <select id="home-type" name="type" className={styles.select} defaultValue="">
              <option value="">Any type</option>
              {(Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[]).map((type) => (
                <option key={type} value={type}>
                  {PROPERTY_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="home-max" className={styles.label}>
              Rent per year, up to
            </label>
            <select id="home-max" name="maxRent" className={styles.select} defaultValue="">
              <option value="">Any amount</option>
              {MAX_RENT_OPTIONS.map((naira) => (
                <option key={naira} value={naira}>
                  {formatNaira(nairaToMinor(naira))}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className={styles.submit}>
            Search available homes
          </button>
        </form>

        <p className={styles.areas}>
          Popular areas:{' '}
          {AREAS.slice(0, 6).map((area, i) => (
            <span key={area.slug}>
              {i > 0 ? ', ' : null}
              <Link href={`/search?area=${area.slug}`}>{area.name}</Link>
            </span>
          ))}
        </p>
      </section>

      <section className="container" aria-labelledby="recent-heading">
        <div className={styles.sectionHead}>
          <h2 id="recent-heading" className={styles.sectionTitle}>
            Recently confirmed
          </h2>
          <p className={styles.count}>
            {available} available {available === 1 ? 'home' : 'homes'} in Jos right now.{' '}
            <Link href="/search">See all</Link>
          </p>
        </div>
        <ListingGrid listings={featured} />
      </section>

      <section className={`container ${styles.how}`} aria-labelledby="how-heading">
        <h2 id="how-heading" className={styles.sectionTitle}>
          How renting through JosHomes works
        </h2>
        <ol className={styles.steps}>
          <li>
            <h3>Search current vacancies</h3>
            <p>
              Filter by area, budget and type of home. Every listing shows when its availability was
              last confirmed.
            </p>
          </li>
          <li>
            <h3>Check the full cost</h3>
            <p>
              See the rent and each additional fee, with an estimated move-in total before you
              travel to inspect.
            </p>
          </li>
          <li>
            <h3>Contact the lister</h3>
            <p>
              Call, chat on WhatsApp, or request an inspection. Verify authority and documents
              before paying anything.
            </p>
          </li>
        </ol>
        <ButtonLink href="/how-it-works" variant="secondary">
          Read the full guide
        </ButtonLink>
      </section>
    </>
  );
}
