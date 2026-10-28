'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Form';
import { signInAction, type AuthFormState } from '@/lib/auth/actions';
import styles from './auth.module.css';

const initialState: AuthFormState = {};

export function SignInForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error ? (
        <Alert tone="caution" title="Could not sign you in">
          {state.error}
        </Alert>
      ) : null}

      <input type="hidden" name="next" value={next} />

      <Field label="Email address" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>

      <Button type="submit" variant="primary" fullWidth disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
