'use client';

import { useActionState } from 'react';
import type { ContactState } from '@/lib/contact-schema';

type Props = { action: (prev: ContactState, formData: FormData) => Promise<ContactState> };

const inputClass =
  'w-full rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-[invalid=true]:border-red-500';

export function ContactForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: 'idle' } as ContactState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  const fields = [
    { id: 'name', label: 'Name', type: 'text', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  ] as const;

  return (
    <form action={formAction} noValidate className="space-y-4 font-mono">
      {fields.map(({ id, label, type, autoComplete }) => {
        const error = fieldErrors[id];
        return (
          <div key={id} className="space-y-1">
            <label htmlFor={`contact-${id}`} className="block text-sm text-fg-muted">
              {label}
            </label>
            <input
              id={`contact-${id}`}
              name={id}
              type={type}
              required
              autoComplete={autoComplete}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `contact-${id}-error` : undefined}
              className={inputClass}
            />
            {error ? (
              <p id={`contact-${id}-error`} className="text-sm text-red-500">
                {error}
              </p>
            ) : null}
          </div>
        );
      })}
      <div className="space-y-1">
        <label htmlFor="contact-message" className="block text-sm text-fg-muted">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          aria-invalid={fieldErrors.message ? true : undefined}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          className={inputClass}
        />
        {fieldErrors.message ? (
          <p id="contact-message-error" className="text-sm text-red-500">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>
      {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:opacity-90 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Send message'}
      </button>
      <div role="status" aria-live="polite" className="text-sm">
        {state.status === 'success' ? <p>Thanks! I’ll get back to you soon.</p> : null}
        {state.status === 'error' && !state.fieldErrors ? <p className="text-red-500">{state.message}</p> : null}
      </div>
    </form>
  );
}
