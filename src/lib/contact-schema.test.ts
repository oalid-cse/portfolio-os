import { describe, expect, it } from 'vitest';
import { contactSchema } from '@/lib/contact-schema';

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, nice portfolio.', website: '' };

describe('contactSchema', () => {
  it('accepts valid input', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it.each([
    ['name too short', { name: 'A' }],
    ['name too long', { name: 'x'.repeat(81) }],
    ['invalid email', { email: 'nope' }],
    ['message too short', { message: 'short' }],
    ['message too long', { message: 'x'.repeat(2001) }],
    ['honeypot filled', { website: 'spam' }],
  ])('rejects %s', (_label, patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});
