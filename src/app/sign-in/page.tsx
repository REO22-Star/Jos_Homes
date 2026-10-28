import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/layout/Prose';
import { Alert } from '@/components/ui/Alert';
import { getCurrentUser } from '@/lib/auth/current-actor';
import { usingDevAuth } from '@/lib/auth';
import { DEV_PASSWORD } from '@/lib/auth/dev-provider';
import { SignInForm } from './SignInForm';
import styles from './auth.module.css';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage your JosHomes listings.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Already signed in? Go straight to the dashboard.
  if (await getCurrentUser()) redirect('/dashboard');

  const { next } = await searchParams;
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  return (
    <div className="container section">
      <div className={styles.wrap}>
        <PageHeader
          eyebrow="Account"
          title="Sign in"
          lead="Browsing does not need an account. Sign in to manage listings."
        />

        <SignInForm next={safeNext} />

        <p className={styles.alt}>
          New here? <Link href="/sign-up">Create an account</Link>
        </p>

        {usingDevAuth() ? (
          <div className={styles.devBox}>
            <Alert tone="info" title="Development sign-in">
              This prototype is running on fictional in-memory accounts because Supabase is not
              configured. Password for all of them: <code>{DEV_PASSWORD}</code>
              <ul className={styles.devList}>
                <li>
                  <code>grace@example.test</code> — lister
                </li>
                <li>
                  <code>seeker@example.test</code> — seeker
                </li>
                <li>
                  <code>mod@example.test</code> — moderator
                </li>
                <li>
                  <code>admin@example.test</code> — administrator
                </li>
              </ul>
            </Alert>
          </div>
        ) : null}
      </div>
    </div>
  );
}
