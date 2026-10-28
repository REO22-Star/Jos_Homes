import type { Metadata } from 'next';
import { PageHeader, Prose } from '@/components/layout/Prose';

export const metadata: Metadata = {
  title: 'About JosHomes | Fair Housing Marketplace for Jos',
  description: 'JosHomes connects home seekers with verified landlords in Jos. Our mission: current, transparent listings. No hidden fees. Fresh inventory weekly.',
};

export default function AboutPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="About"
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
