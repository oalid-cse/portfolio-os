import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/content', () => ({
  getProjects: async () => [{ slug: 'alhisab' }, { slug: 'rebusel' }],
  getPosts: async () => [{ slug: 'hello-world', publishedAt: '2026-01-02', updatedAt: '2026-02-03' }],
}));

import sitemap from './sitemap';

beforeEach(() => vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com'));

describe('sitemap', () => {
  it('includes /, /projects, each project, /blog, published posts, /resume and no /os', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual([
      'https://example.com/',
      'https://example.com/projects',
      'https://example.com/projects/alhisab',
      'https://example.com/projects/rebusel',
      'https://example.com/blog',
      'https://example.com/blog/hello-world',
      'https://example.com/resume',
    ]);
    expect(urls.some((u) => u.includes('/os'))).toBe(false);
  });
});
