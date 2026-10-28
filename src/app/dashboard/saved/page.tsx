import type { Metadata } from 'next';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { requireUser } from '@/lib/auth/current-actor';
import { listSavedListings } from '@/lib/data/seeker';
import { getNow } from '@/lib/now';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Saved homes' };

export default async function SavedPage() {
  const user = await requireUser('/dashboard/saved');
  const saved = listSavedListings(user, getNow());

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Saved homes</h2>
      <p className={styles.role}>Homes you saved to compare later. Only you can see this list.</p>
      {saved.length === 0 ? (
        <EmptyState
          title="No saved properties yet."
          description="Save promising homes so you can compare them later."
        >
          <ButtonLink href="/search">Browse available homes</ButtonLink>
        </EmptyState>
      ) : (
        <ListingGrid listings={saved} />
      )}
    </div>
  );
}
