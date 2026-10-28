'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { primaryNav, siteConfig } from '@/lib/site';
import styles from './Header.module.css';

export interface HeaderAccount {
  displayName: string;
}

export function Header({ account }: { account: HeaderAccount | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const accountLink = account
    ? { href: '/dashboard', label: 'Dashboard' }
    : { href: '/sign-in', label: 'Sign in' };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.brand} aria-label={`${siteConfig.name} home`}>
          <span className={styles.brandMark} aria-hidden="true">
            JH
          </span>
          <span className={styles.brandName}>{siteConfig.name}</span>
        </Link>

        <nav className={styles.desktopNav} aria-label="Primary">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLink}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link href={accountLink.href} className={styles.accountLink}>
            {account ? account.displayName : accountLink.label}
          </Link>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      {open ? (
        <nav id="mobile-nav" className={styles.mobileNav} aria-label="Primary mobile">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <Link href={accountLink.href} className={styles.mobileLink}>
            {account ? `Dashboard (${account.displayName})` : accountLink.label}
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
