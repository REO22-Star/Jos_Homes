import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { AVAILABILITY_COPY } from '@/lib/domain/availability';
import { rentFrequencyLabel } from '@/lib/domain/fees';
import { LISTER_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import { formatNaira } from '@/lib/domain/money';
import type { FeeSummary, PublicListing } from '@/lib/domain/types';
import { ConfirmationStamp } from './ConfirmationStamp';
import { LayoutSketch } from './LayoutSketch';
import { MediaImage } from './MediaImage';
import styles from './ListingCard.module.css';

function homeSummary(listing: PublicListing): string {
  const type = PROPERTY_TYPE_LABEL[listing.propertyType];
  if (listing.propertyType === 'duplex' && listing.bedrooms) {
    return `${type}, ${listing.bedrooms} bedrooms`;
  }
  return type;
}

function moveInLine(fees: FeeSummary): string {
  if (fees.disclosure === 'none_known') return 'No extra fees declared';
  if (fees.disclosure === 'not_stated') return 'Other fees not stated';
  return `Move-in total ${formatNaira(fees.estimatedMoveInTotalMinor)}`;
}

/** True when the listing has a photo to show (uploaded, or a labelled sample). */
export function hasPhoto(listing: PublicListing): boolean {
  return Boolean(listing.media[0]?.url);
}

/**
 * One listing as a row: photo (or layout sketch), details, then rent, move-in
 * cost and the confirmation stamp. The whole row is clickable via the title.
 */
export function ListingCard({ listing }: { listing: PublicListing }) {
  const cover = listing.media[0];
  const rentLine = listing.fees.lines.find((l) => l.key === 'rent');
  const availability = AVAILABILITY_COPY[listing.availabilityState];

  return (
    <article className={styles.row}>
      <div className={styles.cover}>
        {cover?.url ? (
          <MediaImage media={cover} ratio="4 / 3" sizes="(min-width: 760px) 200px, 104px" />
        ) : (
          <LayoutSketch propertyType={listing.propertyType} />
        )}
      </div>

      <div className={styles.info}>
        {listing.sponsorship ? (
          <p className={styles.sponsored}>
            <Badge tone="sponsored">{listing.sponsorship.label}</Badge>
          </p>
        ) : null}
        <h3 className={styles.title}>
          <Link href={`/listing/${listing.slug}`} className={styles.titleLink}>
            {listing.title}
          </Link>
        </h3>
        <p className={styles.place}>
          {listing.area.name}, {listing.publicLandmark}
        </p>
        <p className={styles.facts}>
          <span className={styles.status} data-tone={availability.tone}>
            {availability.label}
          </span>{' '}
          {homeSummary(listing)}
        </p>
        <p className={styles.metric}>
          Listed by: {LISTER_TYPE_LABEL[listing.lister.listerType]}.{' '}
          {listing.metrics.qualifiedViews7d} views in the past 7 days.
        </p>
      </div>

      <div className={styles.money}>
        <p className={styles.rent}>
          <span className={styles.amount}>
            {rentLine ? formatNaira(rentLine.amountMinor ?? 0) : 'Rent not stated'}
          </span>{' '}
          <span className={styles.freq}>{rentFrequencyLabel(listing.fees.rentFrequency)}</span>
        </p>
        <p className={styles.total}>{moveInLine(listing.fees)}</p>
        <div className={styles.stamp}>
          <ConfirmationStamp freshness={listing.freshness} />
        </div>
      </div>
    </article>
  );
}
