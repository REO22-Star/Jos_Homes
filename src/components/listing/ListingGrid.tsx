import type { PublicListing } from '@/lib/domain/types';
import { hasRealPhoto, ListingCard } from './ListingCard';
import styles from './ListingGrid.module.css';

/** Listings as a single bordered list of rows. */
export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  const anySketches = listings.some((listing) => !hasRealPhoto(listing));

  return (
    <>
      {anySketches ? (
        <p className={styles.note}>
          Where no photos have been added yet, a sketch shows a typical layout for that type of
          home, not the actual property.
        </p>
      ) : null}
      <ul className={styles.list}>
        {listings.map((listing) => (
          <li key={listing.id}>
            <ListingCard listing={listing} />
          </li>
        ))}
      </ul>
    </>
  );
}
