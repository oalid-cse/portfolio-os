import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your name.')
    .max(80, 'Name must be 80 characters or fewer.')
    .regex(/^[^\r\n]*$/, 'Name must be on one line.'),
  email: z.string().trim().email('Please enter a valid email.'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message must be 2000 characters or fewer.'),
  /** Honeypot: real visitors never fill this in. */
  website: z.literal(''),
});

/** Email subject for a contact message; control characters are flattened so it stays one header line. */
export function contactSubject(name: string): string {
  const clean = name.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return `Portfolio contact from ${clean || 'a visitor'}`;
}

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactState =
  | { status: 'idle' }
  | { status: 'success' }
  | {
      status: 'error';
      message: string;
      /** Submitted values, echoed back so the form can keep what the visitor typed. */
      values?: { name: string; email: string; message: string };
      fieldErrors?: Partial<Record<'name' | 'email' | 'message', string>>;
    };
