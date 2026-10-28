import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { rentFrequencyLabel } from '@/lib/domain/fees';
import { LISTER_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import { formatNaira } from '@/lib/domain/money';
import type { PublicListing } from '@/lib/domain/types';
import { MediaImage } from './MediaImage';
import { AvailabilityBadge, FreshnessBadge } from './StatusBadges';
import styles from './ListingCard.module.css';

function bedroomSummary(listing: PublicListing): string {
  const type = PROPERTY_TYPE_LABEL[listing.propertyType];
  if (listing.bedrooms && listing.bedrooms > 0) {
    return `${type} · ${listing.bedrooms} bed`;
  }
  return type;
}

export function ListingCard({ listing }: { listing: PublicListing }) {
  const cover = listing.media[0];
  const rentLine = listing.fees.lines.find((l) => l.key === 'rent');

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {cover ? (
          <MediaImage media={cover} ratio="16 / 10" sizes="(min-width: 900px) 360px, 100vw" />
        ) : (
          <div className={styles.noCover}>No photo yet</div>
        )}
        {listing.sponsorship ? (
          <span className={styles.sponsored}>
            <Badge tone="sponsored">{listing.sponsorship.label}</Badge>
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        <div className={styles.badges}>
          <AvailabilityBadge state={listing.availabilityState} />
          <FreshnessBadge freshness={listing.freshness} />
        </div>

        <h3 className={styles.title}>
          <Link href={`/listing/${listing.slug}`} className={styles.titleLink}>
            {listing.title}
          </Link>
        </h3>

        <p className={styles.area}>
          {listing.area.name} · {listing.publicLandmark}
        </p>

        <p className={styles.rent}>
          {rentLine ? formatNaira(rentLine.amountMinor ?? 0) : '—'}{' '}
          <span className={styles.freq}>{rentFrequencyLabel(listing.fees.rentFrequency)}</span>
        </p>

        <p className={styles.meta}>{bedroomSummary(listing)}</p>

        <div className={styles.footer}>
          <span className={styles.lister}>{LISTER_TYPE_LABEL[listing.lister.listerType]}</span>
          <span className={styles.metric}>{listing.metrics.qualifiedViews7d} views · 7 days</span>
        </div>
      </div>
    </article>
  );
}
