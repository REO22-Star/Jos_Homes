import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertTone = 'info' | 'caution' | 'positive';

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

/** A note with a tone-coloured rule on its leading edge; the text carries the meaning. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[tone], className ?? ''].filter(Boolean).join(' ')}
      role="note"
    >
      <div>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
