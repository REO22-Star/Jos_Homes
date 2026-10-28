import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/Prose';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact & complaints',
  description: 'Contact the JosHomes team or raise a complaint about a listing.',
};

export default function ContactPage() {
  return (
    <div className="container section">
      <PageHeader
        eyebrow="Contact"
        title="Contact & complaints"
        lead="Ask a question, report a problem with the service, or raise a complaint about a listing."
      />
      <ContactForm />
    </div>
  );
}
