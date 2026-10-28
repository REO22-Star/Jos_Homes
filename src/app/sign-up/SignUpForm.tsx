'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Form';
import { signUpAction, type AuthFormState } from '@/lib/auth/actions';
import styles from '../sign-in/auth.module.css';

const initialState: AuthFormState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error ? (
        <Alert tone="caution" title="Could not create your account">
          {state.error}
        </Alert>
      ) : null}

      <Field label="Name" htmlFor="displayName" hint="Shown on your account and public profile.">
        <Input id="displayName" name="displayName" autoComplete="name" required />
      </Field>

      <Field label="Email address" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      {/* Only self-service roles are offered. Moderator and administrator
          accounts are granted by an existing administrator, never chosen here. */}
      <Field label="Account type" htmlFor="role">
        <Select id="role" name="role" defaultValue="seeker">
          <option value="seeker">Home seeker: save and compare homes</option>
          <option value="lister">Lister: advertise a vacancy</option>
        </Select>
      </Field>

      <Button type="submit" variant="primary" fullWidth disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
