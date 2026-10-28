'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { CheckboxField, Field, Input, Select, Textarea } from '@/components/ui/Form';
import type { ListingFormState } from '@/lib/listings/actions';
import { FURNISHING_LABEL, PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import type { Area, FurnishingState, PropertyType } from '@/lib/domain/types';
import styles from './ListingForm.module.css';

export interface ListingFormValues {
  title: string;
  description: string;
  areaSlug: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  parkingSpaces: string;
  furnishingState: string;
  privateAddressLine: string;
  privateAddressNotes: string;
  publicLandmark: string;
  approxLocationLabel: string;
  waterSource: string;
  electricityMeter: string;
  features: string;
  houseRules: string;
  rentNaira: string;
  rentFrequency: string;
  feeDisclosure: string;
  agencyNaira: string;
  legalNaira: string;
  cautionNaira: string;
  serviceNaira: string;
  otherNaira: string;
  otherLabel: string;
  availableFrom: string;
  contactPhone: string;
  authorizedToAdvertise: boolean;
}

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[];
const FURNISHINGS = Object.keys(FURNISHING_LABEL) as FurnishingState[];

export function ListingForm({
  action,
  initial,
  areas,
}: {
  action: (prev: ListingFormState, fd: FormData) => Promise<ListingFormState>;
  initial: ListingFormValues;
  areas: Area[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = (field: string) => state.errors?.[field];

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.message ? <Alert tone="positive">{state.message}</Alert> : null}
      {state.error ? (
        <Alert tone="caution" title="Please check the form">
          {state.error}
        </Alert>
      ) : null}

      <fieldset className={styles.group}>
        <legend>Basics</legend>
        <Field label="Listing title" htmlFor="title" error={err('title')}>
          <Input id="title" name="title" defaultValue={initial.title} />
        </Field>
        <Field label="Public description" htmlFor="description" error={err('description')}>
          <Textarea id="description" name="description" defaultValue={initial.description} />
        </Field>
        <div className={styles.row}>
          <Field label="Area" htmlFor="areaSlug" error={err('areaSlug')}>
            <Select id="areaSlug" name="areaSlug" defaultValue={initial.areaSlug}>
              <option value="">Select an area</option>
              {areas.map((a) => (
                <option key={a.slug} value={a.slug}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Property type" htmlFor="propertyType" error={err('propertyType')}>
            <Select id="propertyType" name="propertyType" defaultValue={initial.propertyType}>
              <option value="">Select a type</option>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROPERTY_TYPE_LABEL[t]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Rooms</legend>
        <div className={styles.row}>
          <Field label="Bedrooms" htmlFor="bedrooms">
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min={0}
              defaultValue={initial.bedrooms}
            />
          </Field>
          <Field label="Bathrooms" htmlFor="bathrooms">
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min={0}
              defaultValue={initial.bathrooms}
            />
          </Field>
        </div>
        <div className={styles.row}>
          <Field label="Toilets" htmlFor="toilets">
            <Input
              id="toilets"
              name="toilets"
              type="number"
              min={0}
              defaultValue={initial.toilets}
            />
          </Field>
          <Field label="Parking spaces" htmlFor="parkingSpaces">
            <Input
              id="parkingSpaces"
              name="parkingSpaces"
              type="number"
              min={0}
              defaultValue={initial.parkingSpaces}
            />
          </Field>
        </div>
        <Field label="Furnishing" htmlFor="furnishingState">
          <Select
            id="furnishingState"
            name="furnishingState"
            defaultValue={initial.furnishingState}
          >
            {FURNISHINGS.map((f) => (
              <option key={f} value={f}>
                {FURNISHING_LABEL[f]}
              </option>
            ))}
          </Select>
        </Field>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Location</legend>
        <Field
          label="Private address"
          htmlFor="privateAddressLine"
          hint="Never shown publicly. Used only for the lister and authorized staff."
          error={err('privateAddressLine')}
        >
          <Input
            id="privateAddressLine"
            name="privateAddressLine"
            defaultValue={initial.privateAddressLine}
          />
        </Field>
        <Field label="Private address notes" htmlFor="privateAddressNotes">
          <Input
            id="privateAddressNotes"
            name="privateAddressNotes"
            defaultValue={initial.privateAddressNotes}
          />
        </Field>
        <div className={styles.row}>
          <Field label="Public landmark" htmlFor="publicLandmark">
            <Input
              id="publicLandmark"
              name="publicLandmark"
              defaultValue={initial.publicLandmark}
            />
          </Field>
          <Field label="Approximate location" htmlFor="approxLocationLabel">
            <Input
              id="approxLocationLabel"
              name="approxLocationLabel"
              defaultValue={initial.approxLocationLabel}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Property details</legend>
        <div className={styles.row}>
          <Field label="Water source" htmlFor="waterSource">
            <Input id="waterSource" name="waterSource" defaultValue={initial.waterSource} />
          </Field>
          <Field label="Electricity / meter" htmlFor="electricityMeter">
            <Input
              id="electricityMeter"
              name="electricityMeter"
              defaultValue={initial.electricityMeter}
            />
          </Field>
        </div>
        <Field
          label="Features"
          htmlFor="features"
          hint="Comma-separated, e.g. Tiled floors, Fenced compound"
        >
          <Input id="features" name="features" defaultValue={initial.features} />
        </Field>
        <Field label="House rules" htmlFor="houseRules" hint="Comma-separated">
          <Input id="houseRules" name="houseRules" defaultValue={initial.houseRules} />
        </Field>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Cost</legend>
        <div className={styles.row}>
          <Field label="Rent (NGN)" htmlFor="rentNaira" error={err('rentNaira')}>
            <Input
              id="rentNaira"
              name="rentNaira"
              type="number"
              min={0}
              defaultValue={initial.rentNaira}
            />
          </Field>
          <Field label="Rent frequency" htmlFor="rentFrequency" error={err('rentFrequency')}>
            <Select id="rentFrequency" name="rentFrequency" defaultValue={initial.rentFrequency}>
              <option value="annual">Per year</option>
              <option value="monthly">Per month</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Additional fees disclosure"
          htmlFor="feeDisclosure"
          hint="You must state whether any additional fees apply."
          error={err('feeDisclosure')}
        >
          <Select id="feeDisclosure" name="feeDisclosure" defaultValue={initial.feeDisclosure}>
            <option value="">Select…</option>
            <option value="none_known">No additional fees</option>
            <option value="fees_listed">Additional fees apply (listed below)</option>
          </Select>
        </Field>
        <div className={styles.row}>
          <Field label="Agency fee (NGN)" htmlFor="agencyNaira">
            <Input
              id="agencyNaira"
              name="agencyNaira"
              type="number"
              min={0}
              defaultValue={initial.agencyNaira}
            />
          </Field>
          <Field label="Legal fee (NGN)" htmlFor="legalNaira">
            <Input
              id="legalNaira"
              name="legalNaira"
              type="number"
              min={0}
              defaultValue={initial.legalNaira}
            />
          </Field>
        </div>
        <div className={styles.row}>
          <Field label="Caution fee (NGN)" htmlFor="cautionNaira">
            <Input
              id="cautionNaira"
              name="cautionNaira"
              type="number"
              min={0}
              defaultValue={initial.cautionNaira}
            />
          </Field>
          <Field label="Service charge (NGN)" htmlFor="serviceNaira">
            <Input
              id="serviceNaira"
              name="serviceNaira"
              type="number"
              min={0}
              defaultValue={initial.serviceNaira}
            />
          </Field>
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>Availability &amp; contact</legend>
        <div className={styles.row}>
          <Field label="Available from" htmlFor="availableFrom" error={err('availableFrom')}>
            <Input
              id="availableFrom"
              name="availableFrom"
              type="date"
              defaultValue={initial.availableFrom}
            />
          </Field>
          <Field label="Contact phone" htmlFor="contactPhone" error={err('contactPhone')}>
            <Input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              defaultValue={initial.contactPhone}
            />
          </Field>
        </div>
        <CheckboxField
          id="authorizedToAdvertise"
          name="authorizedToAdvertise"
          label="I confirm I am authorized to advertise this property."
          defaultChecked={initial.authorizedToAdvertise}
        />
        {err('authorizedToAdvertise') ? (
          <p className={styles.fieldError} role="alert">
            {err('authorizedToAdvertise')}
          </p>
        ) : null}
      </fieldset>

      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? 'Saving…' : 'Save draft'}
      </Button>
    </form>
  );
}
