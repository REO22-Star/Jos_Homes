import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { InspectionStatusForm } from '@/components/listing/InspectionStatusForm';
import { requireRole } from '@/lib/auth/current-actor';
import { listInspections } from '@/lib/data/engagement';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Inspection requests' };

export default async function InspectionsPage() {
  const user = await requireRole(['lister']);
  const requests = listInspections(user);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Inspection requests</h2>
      <p className={styles.role}>
        Requests from seekers who want to inspect your properties. Only you can see these details.
      </p>

      {requests.length === 0 ? (
        <EmptyState
          title="No inspection requests yet."
          description="When a seeker requests an inspection on one of your listings, it will appear here."
        />
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: '1fr' }}>
          {requests.map((r) => (
            <Card key={r.id} className={styles.card}>
              <div className={styles.head} style={{ marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 className={styles.cardTitle}>{r.requesterName}</h3>
                  <p className={styles.role}>
                    {r.requesterPhone}, for “{r.listingTitle}”
                  </p>
                </div>
              </div>
              <p className={styles.role}>
                Preferred: {r.preferredDate ?? 'any date'}, {r.preferredTime ?? 'any time'}
              </p>
              {r.message ? <p>{r.message}</p> : null}
              <InspectionStatusForm id={r.id} status={r.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
