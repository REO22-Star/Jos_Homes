import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { ButtonLink } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'Step-by-step guide to searching for rental homes and contacting listers on JosHomes. For seekers and landlords in Jos.',
};

export default function HowItWorksPage() {
  return (
    <div className="container section">
      <PageHeader
        title="How JosHomes works"
        lead="A smaller set of current, locally relevant listings is more useful than a large database of stale ones."
      />
      <Prose>
        <h2>For home seekers</h2>
        <ol>
          <li>Search by area, budget, and property type. You do not need an account to browse.</li>
          <li>
            Open a listing to see photos, the full cost breakdown, and when it was last confirmed.
          </li>
          <li>Contact the lister by call, WhatsApp, or an inspection request.</li>
          <li>Inspect, verify authority and documents, then decide.</li>
        </ol>
        <h2>For listers</h2>
        <ol>
          <li>Create a lister account and complete the required checks.</li>
          <li>Add the property, the public area, rent, and every fee.</li>
          <li>Submit for review. Listings appear publicly only after approval.</li>
          <li>Reconfirm availability regularly and mark the home taken when it goes.</li>
        </ol>
        <h2>What the labels mean</h2>
        <p>
          Verification labels describe exactly what was checked, such as “Phone verified” or
          “Property access verified”. They are not a guarantee of ownership, conduct, or a
          successful transaction.
        </p>
        <p>
          <ButtonLink href="/search">Search available homes</ButtonLink>
        </p>
      </Prose>
    </div>
  );
}
