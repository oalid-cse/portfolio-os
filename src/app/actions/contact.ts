'use server';

import { createSendContact, resendSender } from '@/lib/contact-handler';
import type { ContactState } from '@/lib/contact-schema';

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState> {
  return createSendContact(resendSender)(prev, formData);
}
