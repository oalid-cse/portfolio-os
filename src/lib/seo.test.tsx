import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JsonLd } from '@/components/site/json-ld';
import type { PostFrontmatter, Profile, ProjectFrontmatter } from '@/content/types';
import {
  breadcrumbJsonLd,
  buildMetadata,
  personJsonLd,
  postJsonLd,
  profilePageJsonLd,
  projectJsonLd,
  siteUrl,
  truncateDescription,
} from './seo';

const profile: Profile = {
  name: 'Jane Doe',
  title: 'Engineer',
  tagline: 't',
  summary: 'Summary text.',
  location: 'Dhaka, Bangladesh',
  yearsOfExperience: 5,
  availability: 'open',
  email: 'jane@example.com',
  avatar: '/images/profile.jpg',
  resumePdf: '/r.pdf',
  socials: [
    { label: 'GitHub', url: 'https://github.com/jane', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/jane', icon: 'linkedin' },
    { label: 'WhatsApp', url: 'https://wa.me/123', icon: 'whatsapp' },
  ],
};

const project: ProjectFrontmatter = {
  slug: 'alhisab',
  title: 'Alhisab',
  summary: 'Accounting system.',
  tech: ['Laravel', 'MySQL'],
  role: 'Backend',
  year: 2023,
  featured: true,
  order: 1,
  links: { live: 'https://web.alhisab.app' },
};

const post: PostFrontmatter = {
  slug: 'hello',
  title: 'Hello',
  summary: 'A post.',
  publishedAt: '2026-01-02',
  updatedAt: '2026-02-03',
  tags: ['php'],
};

afterEach(() => vi.unstubAllEnvs());

describe('siteUrl', () => {
  it('uses NEXT_PUBLIC_SITE_URL without trailing slash', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com/');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'portfolio.vercel.app');
    expect(siteUrl()).toBe('https://example.com');
  });
  it('falls back to the Vercel production host', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'portfolio.vercel.app/');
    expect(siteUrl()).toBe('https://portfolio.vercel.app');
  });
  it('falls back to localhost when nothing is set', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', '');
    expect(siteUrl()).toBe('http://localhost:3000');
  });
});

describe('truncateDescription', () => {
  it('leaves short text alone', () => expect(truncateDescription('short text')).toBe('short text'));
  it('cuts at a word boundary within 160 chars', () => {
    const out = truncateDescription('word '.repeat(60));
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });
});

describe('buildMetadata', () => {
  it('sets absolute canonical', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    expect(buildMetadata({ description: 'd', path: '/projects/alhisab' }).alternates?.canonical).toBe(
      'https://example.com/projects/alhisab',
    );
  });
  it('sets OG and Twitter card', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    const m = buildMetadata({ title: 'T', description: 'd', path: '/x', type: 'article' });
    expect(m.title).toBe('T');
    expect(m.openGraph).toMatchObject({ url: 'https://example.com/x', type: 'article', description: 'd' });
    expect(m.twitter).toMatchObject({ card: 'summary_large_image' });
  });
});

describe('json-ld builders', () => {
  it('personJsonLd has name, jobTitle, sameAs socials, image absolute', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    const p = personJsonLd(profile);
    expect(p).toMatchObject({
      '@type': 'Person',
      name: 'Jane Doe',
      jobTitle: 'Engineer',
      image: 'https://example.com/images/profile.jpg',
      sameAs: ['https://github.com/jane', 'https://linkedin.com/in/jane'],
    });
  });
  it('profilePageJsonLd wraps the person', () => {
    expect(profilePageJsonLd(profile)).toMatchObject({ '@type': 'ProfilePage', mainEntity: { '@type': 'Person' } });
  });
  it('projectJsonLd is a CreativeWork', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    expect(projectJsonLd(project)).toMatchObject({
      '@type': 'CreativeWork',
      name: 'Alhisab',
      url: 'https://example.com/projects/alhisab',
      dateCreated: '2023',
    });
  });
  it('postJsonLd is a BlogPosting', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    expect(postJsonLd(post)).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Hello',
      datePublished: '2026-01-02',
      dateModified: '2026-02-03',
      url: 'https://example.com/blog/hello',
    });
  });
  it('breadcrumbJsonLd numbers items with absolute urls', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://example.com');
    expect(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }])).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://example.com/' },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: 'https://example.com/projects' },
      ],
    });
  });
});

describe('JsonLd', () => {
  it('escapes </script>', () => {
    const html = renderToStaticMarkup(<JsonLd data={{ name: '</script><b>' }} />);
    expect(html).not.toContain('</script><b>');
    expect(html).toContain('\\u003c/script>');
    expect(html).toContain('type="application/ld+json"');
  });
});
