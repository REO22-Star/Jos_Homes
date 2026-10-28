import { Badge } from '@/components/ui/Badge';
import { LISTER_TYPE_LABEL, VERIFICATION_HELPER, VERIFICATION_LABEL } from '@/lib/domain/labels';
import type { PublicLister } from '@/lib/domain/types';
import styles from './ListerSummary.module.css';

export function ListerSummary({ lister }: { lister: PublicLister }) {
  const initials = lister.displayName
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {initials || 'JH'}
        </span>
        <div>
          <p className={styles.name}>{lister.displayName}</p>
          <p className={styles.type}>{LISTER_TYPE_LABEL[lister.listerType]}</p>
        </div>
      </div>

      {lister.badges.length > 0 ? (
        <>
          <ul className={styles.badges}>
            {lister.badges.map((b) => (
              <li key={b}>
                <Badge tone="brand">{VERIFICATION_LABEL[b]}</Badge>
              </li>
            ))}
          </ul>
          <p className={styles.helper}>{VERIFICATION_HELPER}</p>
        </>
      ) : (
        <p className={styles.helper}>
          No verification checks have been recorded for this lister yet.
        </p>
      )}
    </div>
  );
}
