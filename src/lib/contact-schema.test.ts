import { describe, expect, it } from 'vitest';
import { contactSchema, contactSubject } from '@/lib/contact-schema';

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
    ['name with LF', { name: 'Ada\nBcc: x@example.com' }],
    ['name with CR', { name: 'Ada\rLovelace' }],
  ])('rejects %s', (_label, patch) => {
    expect(contactSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
});

describe('contactSubject', () => {
  it('builds a one-line subject from the name', () => {
    expect(contactSubject('Ada Lovelace')).toBe('Portfolio contact from Ada Lovelace');
  });
  it('flattens CR/LF and other control characters', () => {
    expect(contactSubject('Ada\r\nBcc: x@example.com\t')).toBe('Portfolio contact from Ada Bcc: x@example.com');
  });
  it('falls back when nothing printable is left', () => {
    expect(contactSubject('\n\r')).toBe('Portfolio contact from a visitor');
  });
});
