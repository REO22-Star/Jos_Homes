import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { WorkflowBadge } from '@/components/listing/WorkflowBadge';
import { requireRole } from '@/lib/auth/current-actor';
import { listMine } from '@/lib/data/authoring';
import { createDraftAction } from '@/lib/listings/actions';
import { formatNaira } from '@/lib/domain/money';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'My listings' };

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const user = await requireRole(['lister']);
  const listings = listMine(user);
  const { submitted } = await searchParams;

  return (
    <div className="stack">
      {submitted ? (
        <Alert tone="positive" title="Submitted for review">
          Your listing was submitted. A moderator will review it before it appears publicly.
        </Alert>
      ) : null}

      <div className={styles.head}>
        <h2 style={{ margin: 0 }}>My listings</h2>
        <form action={createDraftAction}>
          <Button type="submit" variant="primary">
            Create a draft
          </Button>
        </form>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="You have not listed a vacancy yet."
          description="Create a draft and add the property details at your own pace."
        />
      ) : (
        <ul className={styles.list}>
          {listings.map((l) => (
            <li key={l.id} className={styles.listItem}>
              <div>
                <Link href={`/dashboard/listings/${l.id}`} className={styles.listTitle}>
                  {l.title}
                </Link>
                <p className={styles.listMeta}>
                  {l.referenceCode} · {formatNaira(l.rentMinor)} ·{' '}
                  {l.property.areaName || 'Area not set'}
                </p>
              </div>
              <WorkflowBadge state={l.workflowState} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
