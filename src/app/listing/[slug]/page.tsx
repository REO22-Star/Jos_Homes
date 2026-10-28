import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ContactActions } from '@/components/listing/ContactActions';
import { FeeBreakdown } from '@/components/listing/FeeBreakdown';
import { Gallery } from '@/components/listing/Gallery';
import { ListerSummary } from '@/components/listing/ListerSummary';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AvailabilityBadge, FreshnessBadge } from '@/components/listing/StatusBadges';
import { ViewTracker } from '@/components/listing/ViewTracker';
import { AVAILABILITY_COPY } from '@/lib/domain/availability';
import { formatAvailableFrom } from '@/lib/domain/format';
import { FURNISHING_LABEL, PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import { getNow } from '@/lib/now';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { isSaved } from '@/lib/data/seeker';
import { getListingRepository } from '@/lib/data';
import type { PublicListing } from '@/lib/domain/types';
import styles from './listing.module.css';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingRepository().getBySlug(slug, getNow());
  if (!listing) return { title: 'Listing not found' };

  const priceDisplay = `₦${(listing.rentMonthlyKobo / 100).toLocaleString()}`;
  const bedroomsInfo = listing.bedrooms ? ` • ${listing.bedrooms} bed${listing.bedrooms !== 1 ? 's' : ''}` : '';

  // Title/description use only public area — never the private address.
  return {
    title: `${listing.title} | ${priceDisplay}/month | JosHomes`,
    description: `${PROPERTY_TYPE_LABEL[listing.propertyType]} in ${listing.area.name}, Jos${bedroomsInfo}. ${priceDisplay}/month. ${listing.freshness.label}. View photos and contact lister.`,
    openGraph: {
      title: listing.title,
      description: `Available for rent in ${listing.area.name}, Jos. ${priceDisplay}/month.`,
    },
  };
}

function Spec({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === '') return null;
  return (
    <div className={styles.spec}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default async function ListingPage({ params }: { params: Promise<Params> }) {
  const now = getNow();
  const repo = getListingRepository();
  const { slug } = await params;
  const listing: PublicListing | null = await repo.getBySlug(slug, now);
  if (!listing) notFound();

  const availability = AVAILABILITY_COPY[listing.availabilityState];
  const similar = await repo.getSimilar(listing, now, 3);
  const isTaken = listing.availabilityState === 'taken';
  const currentUser = await getCurrentUser();
  const savedByUser = currentUser ? isSaved(currentUser, listing.id) : false;

  return (
    <div className="container section">
      <ViewTracker listingId={listing.id} />
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/search">Available homes</Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/search?area=${listing.area.slug}`}>{listing.area.name}</Link>
      </nav>

      <header className={styles.header}>
        <div className={styles.badges}>
          <AvailabilityBadge state={listing.availabilityState} />
          <FreshnessBadge freshness={listing.freshness} />
          {listing.sponsorship ? <Badge tone="sponsored">{listing.sponsorship.label}</Badge> : null}
        </div>
        <h1>{listing.title}</h1>
        <p className={styles.sub}>
          {listing.area.name} · {listing.publicLandmark} · Ref {listing.referenceCode}
        </p>
      </header>

      {isTaken ? (
        <Alert tone="caution" title="This property is taken">
          {availability.helper}
        </Alert>
      ) : null}
      {listing.availabilityState === 'confirmation_overdue' ? (
        <Alert tone="caution" title={availability.label}>
          {availability.helper}
        </Alert>
      ) : null}

      <div className={styles.galleryWrap}>
        <Gallery media={listing.media} />
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section aria-labelledby="about-heading" className={styles.block}>
            <h2 id="about-heading">About this home</h2>
            <p>{listing.description}</p>
            <p className={styles.availabilityHelper}>{availability.helper}</p>
          </section>

          <section aria-labelledby="details-heading" className={styles.block}>
            <h2 id="details-heading">Property details</h2>
            <dl className={styles.specs}>
              <Spec label="Type" value={PROPERTY_TYPE_LABEL[listing.propertyType]} />
              <Spec label="Bedrooms" value={listing.bedrooms} />
              <Spec label="Bathrooms" value={listing.bathrooms} />
              <Spec label="Toilets" value={listing.toilets} />
              <Spec label="Parking" value={listing.parkingSpaces} />
              <Spec label="Furnishing" value={FURNISHING_LABEL[listing.furnishingState]} />
              <Spec label="Water" value={listing.waterSource} />
              <Spec label="Electricity" value={listing.electricityMeter} />
              <Spec label="Location" value={listing.approxLocationLabel} />
              <Spec label="Move-in" value={formatAvailableFrom(listing.availableFromISO, now)} />
            </dl>
          </section>

          {listing.features.length > 0 ? (
            <section aria-labelledby="features-heading" className={styles.block}>
              <h2 id="features-heading">Features</h2>
              <ul className={styles.tags}>
                {listing.features.map((f) => (
                  <li key={f} className={styles.tag}>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {listing.houseRules.length > 0 ? (
            <section aria-labelledby="rules-heading" className={styles.block}>
              <h2 id="rules-heading">House rules</h2>
              <ul className={styles.rules}>
                {listing.houseRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="location-note" className={styles.block}>
            <h2 id="location-note">Location</h2>
            <p className="muted">
              {listing.approxLocationLabel}. The exact street address is shared privately by the
              lister after you make contact — it is never shown publicly.
            </p>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <Card className={styles.sideCard}>
            <h2 className={styles.sideHeading}>Cost</h2>
            <FeeBreakdown fees={listing.fees} />
          </Card>

          <Card className={styles.sideCard}>
            <h2 className={styles.sideHeading}>Contact</h2>
            <ContactActions listing={listing} initiallySaved={savedByUser} />
          </Card>

          <Card className={styles.sideCard}>
            <h2 className={styles.sideHeading}>Lister</h2>
            <ListerSummary lister={listing.lister} />
          </Card>

          <Card className={styles.sideCard}>
            <h2 className={styles.sideHeading}>Recent activity</h2>
            <p className={styles.metric}>
              <strong>{listing.metrics.qualifiedViews7d}</strong> qualified views in the past 7 days
            </p>
            <p className={styles.metric}>
              <strong>{listing.metrics.inquiries7d}</strong> inquiries in the past 7 days
            </p>
            <p className={styles.metricHelp}>
              Views count distinct recent property-page visits. Inquiries are explicit contact
              actions. We never show who viewed or contacted a listing.
            </p>
          </Card>
        </aside>
      </div>

      {similar.length > 0 ? (
        <section aria-labelledby="similar-heading" className={styles.similar}>
          <h2 id="similar-heading">
            {isTaken ? 'Similar available homes' : 'Similar available properties'}
          </h2>
          <ListingGrid listings={similar} />
        </section>
      ) : null}
    </div>
  );
}
