'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Form';

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();
    if (!name || !message) {
      setError('Enter your name and a short message so we can help.');
      return;
    }
    // Prototype: no real submission occurs.
    setError(null);
    setSent(true);
  }

  if (sent) {
    return (
      <Alert tone="positive" title="Message received">
        Thank you. Our team will review your message. (Prototype: nothing was actually sent.)
      </Alert>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '46ch' }}
    >
      {error ? (
        <Alert tone="caution" title="Please check the form">
          {error}
        </Alert>
      ) : null}
      <Field label="Your name" htmlFor="c-name">
        <Input id="c-name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Email or phone" htmlFor="c-contact" hint="So we can reply to you.">
        <Input id="c-contact" name="contact" />
      </Field>
      <Field label="Message" htmlFor="c-message">
        <Textarea id="c-message" name="message" required />
      </Field>
      <Button type="submit" variant="primary">
        Send message
      </Button>
    </form>
  );
}
