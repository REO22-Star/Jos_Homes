'use client';

import { useActionState, useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { CheckboxField, Field, Input, Select, Textarea } from '@/components/ui/Form';
import { contactActionsEnabled } from '@/lib/domain/availability';
import {
  recordContactAction,
  submitInspectionAction,
  type InspectionFormState,
} from '@/lib/engagement/actions';
import { submitReportAction, type ModState } from '@/lib/moderation/actions';
import { toggleFavoriteAction, type FavoriteState } from '@/lib/seeker/actions';
import type { PublicListing } from '@/lib/domain/types';
import styles from './ContactActions.module.css';

type OpenDialog = null | 'call' | 'whatsapp' | 'inspection' | 'report';

const REPORT_REASONS = [
  'Property appears taken',
  'Price or fees are different',
  'Images do not match',
  'Wrong location',
  'Suspicious or fraudulent behavior',
  'Duplicate listing',
  'Unsafe or inappropriate content',
  'Other',
];

export function ContactActions({
  listing,
  initiallySaved = false,
}: {
  listing: PublicListing;
  initiallySaved?: boolean;
}) {
  const enabled = contactActionsEnabled(listing.availabilityState);
  const [open, setOpen] = useState<OpenDialog>(null);
  const [favState, favAction] = useActionState<FavoriteState, FormData>(
    toggleFavoriteAction.bind(null, listing.id),
    {},
  );
  const currentlySaved = favState.saved ?? initiallySaved;
  const [inspState, inspAction] = useActionState<InspectionFormState, FormData>(
    submitInspectionAction.bind(null, listing.id, listing.title),
    {},
  );
  const [reportState, reportAction] = useActionState<ModState, FormData>(
    submitReportAction.bind(null, listing.id, listing.title),
    {},
  );

  const close = () => setOpen(null);

  return (
    <div className={styles.wrap}>
      {!enabled ? (
        <Alert tone="caution" title="Contact is currently limited">
          {listing.availabilityState === 'taken'
            ? 'This property is taken, so the contact actions are disabled. Explore similar current listings below.'
            : 'This listing is under review, so new inquiries are temporarily limited.'}
        </Alert>
      ) : null}

      <div className={styles.primaryRow}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!enabled}
          onClick={() => {
            setOpen('call');
            void recordContactAction(listing.id, 'call');
          }}
        >
          Call lister
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          disabled={!enabled}
          onClick={() => {
            setOpen('whatsapp');
            void recordContactAction(listing.id, 'whatsapp');
          }}
        >
          Chat on WhatsApp
        </Button>
      </div>

      <Button
        variant="secondary"
        fullWidth
        disabled={!enabled}
        onClick={() => setOpen('inspection')}
      >
        Request an inspection
      </Button>

      <div className={styles.secondaryRow}>
        <form action={favAction}>
          <Button type="submit" variant="ghost" aria-pressed={currentlySaved}>
            {currentlySaved ? '★ Saved' : '☆ Save property'}
          </Button>
        </form>
        <Button variant="ghost" onClick={() => setOpen('report')}>
          Report a problem
        </Button>
      </div>
      {favState.error ? <p className={styles.dialogNote}>{favState.error}</p> : null}

      <p className={styles.safety}>
        Inspect the property, verify the lister&apos;s authority, review the documents, and confirm
        all charges before paying.
      </p>

      {/* Call dialog: reveal-after-action pattern (OQ-007), no real number. */}
      <Dialog open={open === 'call'} onClose={close} title="Call the listing contact">
        <Alert tone="info">
          Call the approved listing contact. JosHomes does not listen to or record the call.
        </Alert>
        <p className={styles.dialogNote}>
          This is a prototype with fictional data, so no real call is placed and the number below is
          not a real person.
        </p>
        <p className={styles.fakeNumber}>+234 800 000 000{listing.referenceCode.slice(-1)}</p>
      </Dialog>

      {/* WhatsApp confirmation (content guide copy). */}
      <Dialog open={open === 'whatsapp'} onClose={close} title="Continue to WhatsApp?">
        <p>
          Your phone number and profile details may become visible to the lister according to your
          WhatsApp settings.
        </p>
        <p className={styles.dialogNote}>
          This is a prototype, so no WhatsApp chat is actually opened.
        </p>
        <div className={styles.dialogActions}>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" onClick={close}>
            I understand
          </Button>
        </div>
      </Dialog>

      {/* Inspection request (records a real inspection request to the lister inbox). */}
      <Dialog open={open === 'inspection'} onClose={close} title="Request an inspection">
        {inspState.ok ? (
          <Alert tone="positive" title="Request sent">
            {inspState.message}
          </Alert>
        ) : (
          <form className={styles.form} action={inspAction} noValidate>
            {inspState.error ? (
              <Alert tone="caution" title="Please check the form">
                {inspState.error}
              </Alert>
            ) : null}
            <Field label="Full name" htmlFor="insp-name" error={inspState.errors?.name}>
              <Input
                id="insp-name"
                name="name"
                autoComplete="name"
                defaultValue={inspState.values?.name}
                required
              />
            </Field>
            <Field
              label="Phone number"
              htmlFor="insp-phone"
              hint="A number the lister can reach you on."
              error={inspState.errors?.phone}
            >
              <Input
                id="insp-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                defaultValue={inspState.values?.phone}
                required
              />
            </Field>
            <Field label="Preferred date" htmlFor="insp-date">
              <Input id="insp-date" name="date" type="date" defaultValue={inspState.values?.date} />
            </Field>
            <Field label="Preferred time" htmlFor="insp-time">
              <Select id="insp-time" name="time" defaultValue="">
                <option value="">No preference</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </Select>
            </Field>
            <Field label="Message to the lister" htmlFor="insp-message">
              <Textarea id="insp-message" name="message" />
            </Field>
            <CheckboxField
              id="insp-consent"
              name="consent"
              label="I agree that JosHomes may share these submitted details with the responsible lister so they can respond to this inspection request."
            />
            {inspState.errors?.consent ? (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', margin: 0 }} role="alert">
                {inspState.errors.consent}
              </p>
            ) : null}
            <Button type="submit" variant="primary" fullWidth>
              Send inspection request
            </Button>
          </form>
        )}
      </Dialog>

      {/* Report a problem. */}
      <Dialog open={open === 'report'} onClose={close} title="Report a problem">
        {reportState.ok ? (
          <Alert tone="positive" title="Report received">
            {reportState.message}
          </Alert>
        ) : (
          <form className={styles.form} action={reportAction}>
            {reportState.error ? (
              <Alert tone="caution" title="Could not send the report">
                {reportState.error}
              </Alert>
            ) : null}
            <fieldset className={styles.fieldset}>
              <legend className={styles.legend}>What is the problem?</legend>
              {REPORT_REASONS.map((reason, i) => (
                <label key={reason} className={styles.radioRow}>
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    defaultChecked={i === 0}
                    className={styles.radio}
                  />
                  {reason}
                </label>
              ))}
            </fieldset>
            <Field label="Optional details" htmlFor="report-details">
              <Textarea id="report-details" name="details" />
            </Field>
            <p className={styles.dialogNote}>
              Your report helps us review the listing. The lister will not see your identity through
              the ordinary report workflow.
            </p>
            <Button type="submit" variant="primary" fullWidth>
              Send report
            </Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
