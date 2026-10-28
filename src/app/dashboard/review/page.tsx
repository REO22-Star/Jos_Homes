import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { WorkflowBadge } from '@/components/listing/WorkflowBadge';
import { requireRole } from '@/lib/auth/current-actor';
import { listReviewQueue } from '@/lib/data/authoring';
import { formatNaira } from '@/lib/domain/money';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Review queue' };

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string }>;
}) {
  const user = await requireRole(['moderator', 'admin']);
  const queue = listReviewQueue(user);
  const { done } = await searchParams;

  return (
    <div className="stack">
      {done ? (
        <Alert tone="positive" title="Decision recorded">
          The listing’s status has been updated and logged.
        </Alert>
      ) : null}

      <h2 style={{ margin: 0 }}>Review queue</h2>
      <p className={styles.role}>Submitted listings awaiting a decision.</p>

      {queue.length === 0 ? (
        <EmptyState
          title="No listings are waiting for review."
          description="Submitted listings will appear here for approval, change requests, or rejection."
        />
      ) : (
        <ul className={styles.list}>
          {queue.map((l) => (
            <li key={l.id} className={styles.listItem}>
              <div>
                <Link href={`/dashboard/review/${l.id}`} className={styles.listTitle}>
                  {l.title}
                </Link>
                <p className={styles.listMeta}>
                  {l.referenceCode} · {formatNaira(l.rentMinor)} · {l.property.areaName} · by{' '}
                  {l.lister.displayName}
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
