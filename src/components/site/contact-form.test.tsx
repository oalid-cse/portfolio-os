import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContactForm } from '@/components/site/contact-form';
import type { ContactState } from '@/lib/contact-schema';

describe('ContactForm', () => {
  afterEach(cleanup);
  it('shows field error text linked via aria-describedby', async () => {
    const action = vi.fn(
      async (): Promise<ContactState> => ({
        status: 'error',
        message: 'Please fix the highlighted fields.',
        fieldErrors: { message: 'Message must be at least 10 characters.' },
      }),
    );
    render(<ContactForm action={action} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    const error = await screen.findByText('Message must be at least 10 characters.');
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-describedby', error.id);
  });
  it('shows the success message', async () => {
    const action = vi.fn(async (): Promise<ContactState> => ({ status: 'success' }));
    render(<ContactForm action={action} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Thanks! I’ll get back to you soon.')).toBeInTheDocument();
  });
  it('shows the generic error message', async () => {
    const action = vi.fn(
      async (): Promise<ContactState> => ({ status: 'error', message: 'Something went wrong. Please email me directly.' }),
    );
    render(<ContactForm action={action} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(await screen.findByText('Something went wrong. Please email me directly.')).toBeInTheDocument();
  });
});
