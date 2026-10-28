import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: 'Privacy (placeholder)',
  description: 'Placeholder privacy notice for the JosHomes prototype.',
};

export default function PrivacyPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="Legal"
        title="Privacy notice"
        lead="Placeholder privacy notice for the prototype."
      />
      <Prose>
        <Alert tone="caution" title="Placeholder document">
          This notice is a placeholder for the prototype. A qualified data-protection review is
          required before any public launch.
        </Alert>
        <h2>What we protect</h2>
        <ul>
          <li>Exact property addresses are private and never shown on public pages.</li>
          <li>Identity and verification documents are access-restricted.</li>
          <li>Reporter identities are not shown to listers through the ordinary workflow.</li>
          <li>
            Public pages show aggregate view and inquiry counts, never who viewed or contacted a
            listing.
          </li>
        </ul>
        <h2>View measurement</h2>
        <p>
          Where views are measured, the platform uses a random anonymous browser identifier for
          de-duplication rather than invasive device fingerprinting, and stores only what is needed
          for aggregate reporting and abuse control.
        </p>
      </Prose>
    </div>
  );
}
