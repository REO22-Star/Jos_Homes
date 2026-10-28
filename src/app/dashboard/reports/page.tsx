import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ReportTriage } from '@/components/listing/ReportTriage';
import { requireRole } from '@/lib/auth/current-actor';
import { listReportsForStaff } from '@/lib/data/reports';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Reports' };

export default async function ReportsPage() {
  const user = await requireRole(['moderator', 'admin']);
  const reports = listReportsForStaff(user);

  return (
    <div className="stack">
      <h2 style={{ margin: 0 }}>Reports</h2>
      <p className={styles.role}>
        Reports from users. The reporter&apos;s identity is never shown to the lister. A report
        never changes a listing on its own — any action is a deliberate decision below.
      </p>

      {reports.length === 0 ? (
        <EmptyState
          title="No reports."
          description="User reports about listings will appear here."
        />
      ) : (
        <div className={styles.cards} style={{ gridTemplateColumns: '1fr' }}>
          {reports.map((r) => (
            <Card key={r.id} className={styles.card}>
              <div className={styles.head} style={{ marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 className={styles.cardTitle}>{r.reasonCode}</h3>
                  <p className={styles.role}>
                    on “{r.listingTitle}” · {new Date(r.createdAtMs).toISOString().slice(0, 10)}
                  </p>
                </div>
                <Badge tone={r.status === 'new' ? 'caution' : 'neutral'}>{r.status}</Badge>
              </div>
              {r.details ? <p>{r.details}</p> : null}
              {r.resolution ? (
                <p className={styles.role}>Resolution: {r.resolution}</p>
              ) : (
                <ReportTriage id={r.id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
