import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: 'Terms (placeholder)',
  description: 'Placeholder terms of service for the JosHomes prototype.',
};

export default function TermsPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="Legal"
        title="Terms of service"
        lead="Placeholder terms for the prototype."
      />
      <Prose>
        <Alert tone="caution" title="Placeholder document">
          These terms are a placeholder for the prototype and are not legally binding. Qualified
          local legal review is required before any public launch.
        </Alert>
        <h2>Using JosHomes</h2>
        <p>
          JosHomes is a listing and communication platform. It does not collect rent, deposits, or
          agency fees, and it is not a party to any rental agreement between a seeker and a lister.
        </p>
        <h2>Listings and verification</h2>
        <p>
          Verification labels describe limited checks only. They do not guarantee ownership,
          conduct, availability, or transaction outcome. Confirm the property, documents, authority,
          and charges before paying.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not post misleading, fraudulent, or unlawful listings. Report suspicious activity so
          the team can review it.
        </p>
      </Prose>
    </div>
  );
}
