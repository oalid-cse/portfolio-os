import 'server-only';
import { Resend } from 'resend';
import { contactSchema, contactSubject, type ContactState } from '@/lib/contact-schema';

export type ContactMessage = { name: string; email: string; message: string };
export type ContactSender = (msg: ContactMessage) => Promise<void>;

export const CONTACT_ERROR_MESSAGE = 'Something went wrong. Please email me directly.';

const field = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
};

export function createSendContact(send: ContactSender) {
  return async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
    // Honeypot: pretend success so bots learn nothing.
    if (field(formData, 'website') !== '') return { status: 'success' };

    const values = { name: field(formData, 'name'), email: field(formData, 'email'), message: field(formData, 'message') };
    const parsed = contactSchema.safeParse({
      ...values,
      website: '',
    });
    if (!parsed.success) {
      const fieldErrors: Partial<Record<'name' | 'email' | 'message', string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === 'name' || key === 'email' || key === 'message') && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return { status: 'error', message: 'Please fix the highlighted fields.', fieldErrors, values };
    }

    try {
      const { name, email, message } = parsed.data;
      await send({ name, email, message });
      return { status: 'success' };
    } catch {
      return { status: 'error', message: CONTACT_ERROR_MESSAGE, values };
    }
  };
}

export const resendSender: ContactSender = async ({ name, email, message }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) throw new Error('Contact form is not configured.');
  const { error } = await new Resend(apiKey).emails.send({
    from: 'onboarding@resend.dev',
    to,
    replyTo: email,
    subject: contactSubject(name),
    text: `From: ${name} <${email}>\n\n${message}`,
  });
  if (error) throw new Error(error.message);
};
