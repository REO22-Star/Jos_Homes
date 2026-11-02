import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/Prose';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { SignUpForm } from './SignUpForm';
import styles from '../sign-in/auth.module.css';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Create a JosHomes account to save homes or advertise a vacancy.',
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string | string[] }>;
}) {
  if (await getCurrentUser()) redirect('/dashboard');
  // "List a property" links here with ?as=lister; anything else keeps the seeker default.
  const defaultRole = (await searchParams).as === 'lister' ? 'lister' : 'seeker';

  return (
    <div className="container section">
      <div className={styles.wrap}>
        <PageHeader
          title="Create an account"
          lead="You do not need an account to browse. Create one to save homes or list a vacancy."
        />
        <SignUpForm defaultRole={defaultRole} />
        <p className={styles.alt}>
          Already have an account? <Link href="/sign-in">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
