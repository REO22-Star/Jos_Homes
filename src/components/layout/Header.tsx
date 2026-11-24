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
          {siteConfig.name}
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
          {/* Drawn as SVG, not the ☰/✕ characters, which differ between Android fonts. */}
          <svg
            className={styles.menuIcon}
            viewBox="0 0 20 20"
            width="20"
            height="20"
            aria-hidden="true"
            focusable="false"
          >
            {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 5.5h14M3 10h14M3 14.5h14" />}
          </svg>
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
