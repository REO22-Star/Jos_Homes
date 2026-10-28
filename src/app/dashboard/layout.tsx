import Link from 'next/link';
import { requireUser } from '@/lib/auth/current-actor';
import { signOutAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';
import { isStaff } from '@/lib/domain/authorization';
import styles from './dashboard.module.css';

/**
 * Every dashboard route is guarded here on the server. An unauthenticated
 * visitor is redirected to sign-in before any protected content renders.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const links = [
    { href: '/dashboard', label: 'Overview', show: true },
    { href: '/dashboard/saved', label: 'Saved homes', show: user.role === 'seeker' },
    { href: '/dashboard/searches', label: 'Saved searches', show: user.role === 'seeker' },
    { href: '/dashboard/listings', label: 'My listings', show: user.role === 'lister' },
    { href: '/dashboard/inspections', label: 'Inspection requests', show: user.role === 'lister' },
    { href: '/dashboard/review', label: 'Review queue', show: isStaff(user.role) },
    { href: '/dashboard/reports', label: 'Reports', show: isStaff(user.role) },
    { href: '/dashboard/admin', label: 'Administration', show: user.role === 'admin' },
    { href: '/dashboard/notifications', label: 'Notifications', show: true },
    { href: '/dashboard/preferences', label: 'Preferences', show: true },
  ].filter((l) => l.show);

  return (
    <div className="container section">
      <div className={styles.head}>
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className={styles.title}>{user.displayName}</h1>
          <p className={styles.role}>
            Signed in as <strong>{user.role}</strong> · {user.email}
          </p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>

      <div className={styles.layout}>
        <nav className={styles.nav} aria-label="Dashboard">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
