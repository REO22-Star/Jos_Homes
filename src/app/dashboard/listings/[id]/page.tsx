import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { AvailabilityControls } from '@/components/listing/AvailabilityControls';
import { ListingForm, type ListingFormValues } from '@/components/listing/ListingForm';
import { MediaManager } from '@/components/listing/MediaManager';
import { SubmitForReview } from '@/components/listing/SubmitForReview';
import { WorkflowBadge } from '@/components/listing/WorkflowBadge';
import { AREAS } from '@/lib/data/areas';
import { getMine, lastModerationNote, readinessFor } from '@/lib/data/authoring';
import type { AuthoredRecord } from '@/lib/data/authoring-store';
import { requireRole } from '@/lib/auth/current-actor';
import { saveDraftAction } from '@/lib/listings/actions';
import styles from '../../dashboard.module.css';

export const metadata: Metadata = { title: 'Edit listing' };

const naira = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? '' : String(Math.round(minor / 100));

function toValues(r: AuthoredRecord): ListingFormValues {
  return {
    title: r.title,
    description: r.description,
    areaSlug: r.property.areaSlug,
    propertyType: r.property.propertyType,
    bedrooms: r.property.bedrooms?.toString() ?? '',
    bathrooms: r.property.bathrooms?.toString() ?? '',
    toilets: r.property.toilets?.toString() ?? '',
    parkingSpaces: r.property.parkingSpaces?.toString() ?? '',
    furnishingState: r.property.furnishingState,
    privateAddressLine: r.property.privateAddressLine,
    privateAddressNotes: r.property.privateAddressNotes ?? '',
    publicLandmark: r.property.publicLandmark,
    approxLocationLabel: r.property.approxLocationLabel,
    waterSource: r.property.waterSource ?? '',
    electricityMeter: r.property.electricityMeter ?? '',
    features: r.property.features.join(', '),
    houseRules: r.property.houseRules.join(', '),
    rentNaira: naira(r.rentMinor),
    rentFrequency: r.rentFrequency,
    feeDisclosure: r.feeDisclosure === 'not_stated' ? '' : r.feeDisclosure,
    agencyNaira: naira(r.agencyMinor),
    legalNaira: naira(r.legalMinor),
    cautionNaira: naira(r.cautionMinor),
    serviceNaira: naira(r.serviceMinor),
    otherNaira: naira(r.otherMinor),
    otherLabel: r.otherLabel ?? '',
    availableFrom: r.availableFromISO ?? '',
    contactPhone: r.lister.privatePhoneE164,
    authorizedToAdvertise: r.authorizedToAdvertise,
  };
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole(['lister']);
  const { id } = await params;
  const record = getMine(user, id);
  if (!record) notFound();

  const missing = readinessFor(record);
  const feedback = lastModerationNote(record);
  const editable = ['draft', 'changes_requested', 'rejected'].includes(record.workflowState);
  const canSubmit =
    missing.length === 0 &&
    (record.workflowState === 'draft' || record.workflowState === 'changes_requested');

  return (
    <div className="stack">
      <p>
        <Link href="/dashboard/listings">Back to listings</Link>
      </p>

      <div className={styles.head}>
        <div>
          <h2 style={{ margin: 0 }}>{record.title}</h2>
          <p className={styles.role}>{record.referenceCode}</p>
        </div>
        <WorkflowBadge state={record.workflowState} />
      </div>

      {feedback && record.workflowState === 'changes_requested' ? (
        <Alert tone="caution" title="Changes requested by the moderator">
          {feedback}
        </Alert>
      ) : null}
      {feedback && record.workflowState === 'rejected' ? (
        <Alert tone="caution" title="This listing was rejected">
          {feedback}
        </Alert>
      ) : null}

      {!editable ? (
        <Alert tone="info" title="This listing is locked">
          A listing can only be edited while it is a draft, has changes requested, or was rejected.
          Its current status is “{record.workflowState}”.
        </Alert>
      ) : null}

      {record.workflowState === 'approved' ? (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>Availability</h3>
          <AvailabilityControls id={id} state={record.availabilityState} />
        </Card>
      ) : null}

      {missing.length > 0 ? (
        <Alert tone="info" title="Before you can submit">
          <ul>
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {editable ? (
        <Card className={styles.card}>
          <h3 className={styles.cardTitle}>Photos</h3>
          <MediaManager
            id={id}
            media={record.media.map((m) => ({
              id: m.id,
              url: m.objectId ? `/api/media/${m.objectId}` : undefined,
              state: m.moderationState,
            }))}
          />
        </Card>
      ) : null}

      {editable ? (
        <ListingForm
          action={saveDraftAction.bind(null, id)}
          initial={toValues(record)}
          areas={AREAS}
        />
      ) : null}

      {canSubmit ? <SubmitForReview id={id} /> : null}
    </div>
  );
}
