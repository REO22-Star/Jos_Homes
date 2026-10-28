import type { PublicListing } from '@/lib/domain/types';
import { hasPhoto, ListingCard } from './ListingCard';
import styles from './ListingGrid.module.css';

/** Listings as a single bordered list of rows. */
export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  const anySketches = listings.some((listing) => !hasPhoto(listing));
  const anySamples = listings.some((listing) => listing.media[0]?.isSample);

  return (
    <>
      {anySamples ? (
        <p className={styles.note}>
          Photos marked “Sample photo” are stock images from Unsplash and Pexels, standing in until
          listers add photos of the actual property.
        </p>
      ) : null}
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
