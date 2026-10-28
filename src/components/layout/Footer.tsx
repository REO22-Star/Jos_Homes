import Link from 'next/link';
import { footerNav, siteConfig } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <span className={styles.brand}>{siteConfig.name}</span>
            <p className={styles.tagline}>{siteConfig.tagline}</p>
          </div>
          <nav className={styles.links} aria-label="Footer">
            {footerNav.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p className={styles.disclaimer}>{siteConfig.disclaimer}</p>
        <p className={styles.meta}>
          © {year} {siteConfig.name} (prototype). Fictional sample data, not real listings.
        </p>
      </div>
    </footer>
  );
}
