import type { Metadata } from 'next';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { AdminVerificationPanel } from '@/components/listing/AdminVerificationPanel';
import { requireRole } from '@/lib/auth/current-actor';
import { listAudit } from '@/lib/data/authoring-store';
import { adminAnalytics, availabilityQueue } from '@/lib/data/analytics';
import { listVerificationsForAdmin } from '@/lib/data/verification';
import { getNow } from '@/lib/now';
import styles from '../dashboard.module.css';

export const metadata: Metadata = { title: 'Administration' };

const GRACE = 'a0000000-0000-4000-8000-000000000001';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireRole(['admin']);
  const now = getNow();
  const { q } = await searchParams;

  const stats = adminAnalytics(now);
  const overdue = availabilityQueue(now);
  const audit = listAudit(q).slice(0, 40);
  const graceRecords = listVerificationsForAdmin(user, GRACE).map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
  }));

  const tiles: Array<[string, number]> = [
    ['Approved listings', stats.totalApproved],
    ['Available now', stats.available],
    ['Taken', stats.taken],
    ['Confirmation overdue', stats.overdue],
    ['Open reports', stats.openReports],
  ];

  return (
    <div className="stack">
      <Alert tone="caution" title="Sensitive area">
        Role changes, verification decisions, and evidence access are administrator-only and are
        recorded in the audit log.
      </Alert>

      <section>
        <h2 style={{ margin: '0 0 var(--space-3)' }}>Overview</h2>
        <div
          className={styles.cards}
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
        >
          {tiles.map(([label, value]) => (
            <Card key={label} className={styles.card}>
              <p className={styles.stat}>{value}</p>
              <p className={styles.muted}>{label}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Availability queue (overdue)</h3>
        {overdue.length === 0 ? (
          <p className="muted">No listings are overdue for confirmation.</p>
        ) : (
          <ul className={styles.list}>
            {overdue.map((l) => (
              <li key={l.id} className={styles.listMeta} style={{ marginTop: 0 }}>
                {l.title}: {l.freshness.label}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Verification records</h3>
        <AdminVerificationPanel
          subjectId={GRACE}
          subjectName="Grace Estates (fictional)"
          records={graceRecords}
        />
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Audit log</h3>
        <form
          method="get"
          style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}
        >
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search actions…"
            aria-label="Search the audit log"
            style={{
              flex: 1,
              minHeight: 40,
              padding: '8px 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              color: 'var(--ink)',
            }}
          />
        </form>
        {audit.length === 0 ? (
          <p className="muted">No audit entries match.</p>
        ) : (
          <ul className={styles.list}>
            {audit.map((a) => (
              <li key={a.id} className={styles.listMeta} style={{ marginTop: 0 }}>
                {a.atISO.slice(0, 19).replace('T', ' ')}, <strong>{a.action}</strong>,{' '}
                {a.targetType}
                {a.summary ? `: ${a.summary}` : ''}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
