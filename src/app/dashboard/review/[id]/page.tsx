import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ModerationPanel } from '@/components/listing/ModerationPanel';
import { MediaReview } from '@/components/listing/MediaReview';
import { WorkflowBadge } from '@/components/listing/WorkflowBadge';
import { requireRole } from '@/lib/auth/current-actor';
import { getForReview } from '@/lib/data/authoring';
import { FURNISHING_LABEL, LISTER_TYPE_LABEL, PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import { formatNaira } from '@/lib/domain/money';
import styles from '../../dashboard.module.css';

export const metadata: Metadata = { title: 'Review listing' };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p style={{ margin: '0 0 6px' }}>
      <span className={styles.role}>{label}: </span>
      <strong>{value}</strong>
    </p>
  );
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['moderator', 'admin']);
  const { id } = await params;
  const record = getForReview(user, id);
  if (!record) notFound();

  const p = record.property;

  return (
    <div className="stack">
      <p>
        <Link href="/dashboard/review">Back to review queue</Link>
      </p>

      <div className={styles.head}>
        <div>
          <h2 style={{ margin: 0 }}>{record.title}</h2>
          <p className={styles.role}>
            {record.referenceCode}, by {record.lister.displayName} (
            {LISTER_TYPE_LABEL[record.lister.listerType]})
          </p>
        </div>
        <WorkflowBadge state={record.workflowState} />
      </div>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Listing content</h3>
        <p>{record.description}</p>
        <Row label="Type" value={PROPERTY_TYPE_LABEL[p.propertyType]} />
        <Row
          label="Rooms"
          value={`${p.bedrooms ?? 0} bed, ${p.bathrooms ?? 0} bath, ${p.toilets ?? 0} toilet`}
        />
        <Row label="Furnishing" value={FURNISHING_LABEL[p.furnishingState]} />
        <Row label="Rent" value={`${formatNaira(record.rentMinor)} (${record.rentFrequency})`} />
        <Row label="Fees disclosure" value={record.feeDisclosure} />
        <Row label="Available from" value={record.availableFromISO ?? 'Not stated'} />
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Private details (staff only)</h3>
        <Alert tone="caution">
          These are visible to authorized staff for moderation and must never be published.
        </Alert>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <Row label="Private address" value={p.privateAddressLine || 'Not provided'} />
          <Row label="Public area" value={`${p.areaName}, ${p.publicLandmark}`} />
          <Row label="Contact phone" value={record.lister.privatePhoneE164 || 'Not provided'} />
        </div>
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Photos</h3>
        <p className={styles.role}>
          Only approved images appear on the public listing. Approve or reject each one.
        </p>
        <MediaReview
          id={id}
          media={record.media.map((m) => ({
            id: m.id,
            url: m.objectId ? `/api/media/${m.objectId}` : undefined,
            state: m.moderationState,
          }))}
        />
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>Decision</h3>
        <ModerationPanel id={id} canSuspend={record.workflowState === 'approved'} />
      </Card>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>History</h3>
        <ul className={styles.list}>
          {record.statusHistory.map((h) => (
            <li key={h.id} className={styles.listMeta} style={{ marginTop: 0 }}>
              {h.changeType}
              {h.newWorkflowState ? `, changed to ${h.newWorkflowState}` : ''}
              {h.note ? `: ${h.note}` : ''}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
