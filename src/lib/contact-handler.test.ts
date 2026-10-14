import { describe, expect, it, vi } from 'vitest';
import { createSendContact } from '@/lib/contact-handler';

const valid = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, nice portfolio.', website: '' };
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const idle = { status: 'idle' } as const;

describe('createSendContact', () => {
  it('sends valid input and returns success', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    expect(await createSendContact(send)(idle, fd(valid))).toEqual({ status: 'success' });
    expect(send).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com', message: valid.message });
  });
  it('rejects short message with fieldErrors.message', async () => {
    const send = vi.fn();
    const res = await createSendContact(send)(idle, fd({ ...valid, message: 'short' }));
    expect(res.status).toBe('error');
    expect(res.status === 'error' && res.fieldErrors?.message).toBeTruthy();
    expect(res.status === 'error' && res.values).toEqual({ name: 'Ada', email: 'ada@example.com', message: 'short' });
    expect(send).not.toHaveBeenCalled();
  });
  it('honeypot filled returns success without calling send', async () => {
    const send = vi.fn();
    expect(await createSendContact(send)(idle, fd({ ...valid, website: 'spam' }))).toEqual({ status: 'success' });
    expect(send).not.toHaveBeenCalled();
  });
  it('send throws returns the generic error state', async () => {
    const send = vi.fn().mockRejectedValue(new Error('boom'));
    expect(await createSendContact(send)(idle, fd(valid))).toEqual({
      status: 'error',
      message: 'Something went wrong. Please email me directly.',
      values: { name: 'Ada', email: 'ada@example.com', message: valid.message },
    });
  });
});
