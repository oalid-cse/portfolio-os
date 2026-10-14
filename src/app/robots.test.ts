import { beforeEach, describe, expect, it, vi } from 'vitest';
import robots from './robots';

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com'));

describe('robots', () => {
  it('disallows /os/ and points to sitemap', () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    if (!rule) throw new Error('no rules');
    expect(rule.disallow).toContain('/os/');
    expect(rule.allow).toBe('/');
    expect(r.sitemap).toBe('https://example.com/sitemap.xml');
  });
});
