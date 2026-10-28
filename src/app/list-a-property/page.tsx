import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { Alert } from '@/components/ui/Alert';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'List Your Rental Property | Free Listing on JosHomes',
  description: 'Post your rental vacancy on JosHomes. Free for 30 days. Reach qualified seekers. Manage inquiries in one place. Get verified as a landlord.',
};

export default function ListAPropertyPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="For listers"
        title="List a vacancy in Jos"
        lead="Advertise a current vacancy, reach better-qualified seekers, and manage availability from one dashboard."
      />
      <Prose>
        <p>
          Landlords, agents, and caretakers can publish vacancies with clear costs and useful media.
          Listings are reviewed before they appear publicly, and you reconfirm availability so
          seekers can trust what they see.
        </p>
        <Alert tone="info" title="Coming in a later milestone">
          Account creation and the listing submission workflow are not part of this prototype yet.
          This page describes what listers will be able to do.
        </Alert>
        <p>
          <ButtonLink href="/how-it-works" variant="secondary">
            See how it works
          </ButtonLink>
        </p>
      </Prose>
    </div>
  );
}
