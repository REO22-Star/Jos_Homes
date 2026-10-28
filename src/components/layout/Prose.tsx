import type { ReactNode } from 'react';
import styles from './Prose.module.css';

export function PageHeader({ title, lead }: { title: string; lead?: string }) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
