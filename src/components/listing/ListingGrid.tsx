import type { PublicListing } from '@/lib/domain/types';
import { ListingCard } from './ListingCard';
import styles from './ListingGrid.module.css';

export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  return (
    <ul className={styles.grid}>
      {listings.map((listing) => (
        <li key={listing.id}>
          <ListingCard listing={listing} />
        </li>
      ))}
    </ul>
  );
}
