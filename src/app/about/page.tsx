import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';

export const metadata: Metadata = {
  title: 'About',
  description:
    'JosHomes lists long-term rental homes in Jos, shows when each vacancy was last confirmed, and sets out the rent and fees the lister has declared.',
};

export default function AboutPage() {
  return (
    <div className="container section">
      <PageHeader
        title="About JosHomes"
        lead="A current, trustworthy place to find long-term rental homes in Jos, Plateau State."
      />
      <Prose>
        <p>
          JosHomes helps residents answer a simple question: which homes are genuinely available in
          Jos right now, what will they cost, and who can I safely contact? We focus on freshness,
          transparent costs, and clear information about the person behind each listing.
        </p>
        <p>
          The first version is a discovery, verification, and communication product. It does not
          collect rent, deposits, or agency fees. Payments, escrow, property sales, and nationwide
          expansion are outside this release.
        </p>
        <p>
          This is an early prototype built with fictional sample data. Nothing shown here represents
          a real property, person, or phone number.
        </p>
      </Prose>
    </div>
  );
}
