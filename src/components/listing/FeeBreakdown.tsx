import { rentFrequencyLabel } from '@/lib/domain/fees';
import { formatNaira } from '@/lib/domain/money';
import type { FeeSummary } from '@/lib/domain/types';
import styles from './FeeBreakdown.module.css';

export function FeeBreakdown({ fees }: { fees: FeeSummary }) {
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <caption className="sr-only">Rent and additional fees</caption>
        <tbody>
          {fees.lines.map((line) => (
            <tr key={line.key}>
              <th scope="row" className={styles.label}>
                {line.label}
                {line.key === 'rent' ? (
                  <span className={styles.freq}> {rentFrequencyLabel(fees.rentFrequency)}</span>
                ) : null}
              </th>
              <td className={styles.amount}>
                {line.amountMinor === null ? (
                  <span className={styles.notStated}>Not stated</span>
                ) : (
                  formatNaira(line.amountMinor)
                )}
              </td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <th scope="row" className={styles.totalLabel}>
              Estimated move-in total
            </th>
            <td className={styles.totalAmount}>{formatNaira(fees.estimatedMoveInTotalMinor)}</td>
          </tr>
        </tbody>
      </table>

      {fees.disclosure === 'none_known' ? (
        <p className={styles.note}>No additional fee was declared by the lister.</p>
      ) : null}
      <p className={styles.note}>
        This total is based on the amounts supplied by the lister. Confirm every charge before
        making a commitment. Amounts marked “Not stated” are not included in the total.
      </p>
    </div>
  );
}
