import { afterEach, describe, expect, it, vi } from 'vitest';
import { isContactFormEnabled } from '@/lib/features';

describe('isContactFormEnabled', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is true only when both env vars are set', () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', 'me@example.com');
    expect(isContactFormEnabled()).toBe(true);
  });
  it('is false when either is missing', () => {
    vi.stubEnv('RESEND_API_KEY', 'key');
    vi.stubEnv('CONTACT_TO_EMAIL', '');
    expect(isContactFormEnabled()).toBe(false);
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('CONTACT_TO_EMAIL', 'me@example.com');
    expect(isContactFormEnabled()).toBe(false);
  });
});
