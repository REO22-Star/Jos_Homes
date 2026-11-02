import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { ButtonLink } from '@/components/ui/Button';
import { DEFAULT_FRESHNESS_CONFIG, DEFAULT_MEDIA_CONFIG } from '@/lib/domain/config';

export const metadata: Metadata = {
  title: 'List a rental vacancy in Jos',
  description:
    'Advertise a current rental vacancy in Jos. Listings are reviewed before they appear publicly, and you keep availability up to date from your dashboard.',
};

export default function ListAPropertyPage() {
  const media = DEFAULT_MEDIA_CONFIG;
  const freshness = DEFAULT_FRESHNESS_CONFIG;
  const maxMb = Math.round(media.maxImageBytes / (1024 * 1024));

  return (
    <div className="container section">
      <PageHeader
        title="List a vacancy in Jos"
        lead="Advertise a current vacancy, reach better-qualified seekers, and manage availability from one dashboard."
      />
      <Prose>
        <p>
          Landlords, agents, and caretakers can publish vacancies with clear costs and useful media.
          Listings are reviewed before they appear publicly, and you reconfirm availability so
          seekers can trust what they see.
        </p>

        <h2>What you need</h2>
        <ul>
          <li>A JosHomes lister account.</li>
          <li>
            The property details and its public area, such as the neighbourhood and a nearby
            landmark. The exact street address stays private and is never shown publicly.
          </li>
          <li>The rent and every additional fee, so seekers can see the full move-in cost.</li>
          <li>
            At least {media.minImagesForSubmission} photos of the actual property (JPEG, PNG or
            WebP, up to {maxMb} MB each, {media.maxImagesPerListing} at most).
          </li>
        </ul>

        <h2>From draft to live listing</h2>
        <ol>
          <li>Create a lister account and sign in to your dashboard.</li>
          <li>Create a draft and add the property details at your own pace.</li>
          <li>
            Submit it for review. The JosHomes team checks the listing and either approves it or
            asks you for changes.
          </li>
          <li>Once approved, it appears in search with the date you last confirmed it.</li>
        </ol>

        <h2>Keeping your listing current</h2>
        <p>
          Reconfirm availability from your dashboard at least every {freshness.overdueDays} days.
          After that, seekers see “Availability needs confirmation”, and after{' '}
          {freshness.suppressDays} days the listing is removed from ordinary search. You can also
          pause a listing or mark it as taken at any time.
        </p>

        <p>
          <ButtonLink href="/sign-up?as=lister">Create a lister account</ButtonLink>
        </p>
        <p>
          Already have an account? <Link href="/sign-in">Sign in</Link> to manage your listings.
        </p>
      </Prose>
    </div>
  );
}
