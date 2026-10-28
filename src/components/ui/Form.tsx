import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import styles from './Form.module.css';

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Wraps a control with a programmatic label, optional hint, and validation
 * error. The error id is wired via aria-describedby by callers using the same
 * `${htmlFor}-error` convention (docs/ACCEPTANCE_TESTS.md K2).
 */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {hint ? (
        <p id={`${htmlFor}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={styles.control} {...props} />;
}

export function Select({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={styles.control} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={[styles.control, styles.textarea].join(' ')} {...props} />;
}

export function CheckboxField({
  id,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={styles.checkboxRow}>
      <input id={id} type="checkbox" className={styles.checkbox} {...props} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
