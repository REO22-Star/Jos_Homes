import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';
import { Alert } from '@/components/ui/Alert';

export const metadata: Metadata = {
  title: 'Housing Safety Guide | Avoid Scams When Renting in Jos',
  description: 'Protect yourself when searching for rentals. Red flags, verification tips, property inspection checklist, and landlord safety checks.',
};

export default function SafetyPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="Stay safe"
        title="Safety guide"
        lead="Use these steps to protect yourself when inspecting a home and dealing with a lister."
      />
      <Prose>
        <ul>
          <li>Verify that the property exists and matches the listing.</li>
          <li>Meet in a safe manner and tell someone where you are going.</li>
          <li>Confirm the lister&apos;s authority to advertise or transact.</li>
          <li>Review relevant documents and charges.</li>
          <li>Do not rely on a badge as a complete guarantee.</li>
          <li>Keep records of important conversations and receipts.</li>
          <li>Report misleading, unavailable, or suspicious listings.</li>
          <li>Seek qualified professional help for legal or financial questions.</li>
        </ul>
        <Alert tone="caution" title="Never pay before you verify">
          JosHomes does not collect rent, deposits, or agency fees. Confirm the property, documents,
          authority, and charges before paying anyone.
        </Alert>
      </Prose>
    </div>
  );
}
