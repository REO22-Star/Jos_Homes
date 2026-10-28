import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AREAS } from '@/lib/data/areas';
import { getListingRepository } from '@/lib/data';
import { getNow } from '@/lib/now';
import { siteConfig } from '@/lib/site';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Houses for Rent in Jos, Plateau State | JosHomes',
  description: 'Find verified rental vacancies in Jos. Search by area, price, bedrooms. See photos, itemized costs, and contact landlords directly. Fresh listings updated weekly.',
};

export default async function HomePage() {
  const now = getNow();
  const repo = getListingRepository();
  const [featured, available] = await Promise.all([
    repo.getFeatured(now, 6),
    repo.countAvailable(now),
  ]);

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <p className="eyebrow">Rentals in Jos, Plateau State</p>
          <h1 className={styles.title}>{siteConfig.tagline}</h1>
          <p className={styles.lead}>{siteConfig.description}</p>

          <div className={styles.ctaRow}>
            <ButtonLink href="/search" size="lg">
              Search available homes
            </ButtonLink>
            <ButtonLink href="/list-a-property" size="lg" variant="secondary">
              List a vacancy
            </ButtonLink>
          </div>

          <p className={styles.headline}>
            <strong>{available}</strong> fresh, available{' '}
            {available === 1 ? 'vacancy' : 'vacancies'} in Jos right now
          </p>

          <nav className={styles.areaChips} aria-label="Browse popular areas">
            {AREAS.slice(0, 6).map((area) => (
              <Link key={area.slug} href={`/search?area=${area.slug}`} className={styles.chip}>
                {area.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="container section">
        <div className={styles.sectionHead}>
          <h2>Recently confirmed listings</h2>
          <Link href="/search" className={styles.seeAll}>
            See all available homes →
          </Link>
        </div>
        <ListingGrid listings={featured} />
      </section>

      <section className={styles.stepsWrap}>
        <div className="container section">
          <h2>How JosHomes works</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNum}>1</span>
              <h3>Search current vacancies</h3>
              <p className="muted">
                Filter by area, budget, and property type. Every listing shows when its availability
                was last confirmed.
              </p>
            </li>
            <li>
              <span className={styles.stepNum}>2</span>
              <h3>Understand the full cost</h3>
              <p className="muted">
                See rent and each additional fee clearly, with an estimated move-in total before you
                travel to inspect.
              </p>
            </li>
            <li>
              <span className={styles.stepNum}>3</span>
              <h3>Contact the responsible lister</h3>
              <p className="muted">
                Call, chat on WhatsApp, or request an inspection. Verify authority and documents
                before paying anything.
              </p>
            </li>
          </ol>
          <ButtonLink href="/how-it-works" variant="secondary">
            Read the full guide
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
