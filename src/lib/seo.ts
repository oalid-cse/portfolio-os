import type { Metadata } from 'next';
import type { BlogPosting, BreadcrumbList, CreativeWork, Person, ProfilePage, WithContext } from 'schema-dts';
import type { PostFrontmatter, Profile, ProjectFrontmatter } from '@/content/types';

const FALLBACK_SITE_URL = 'https://abubinoalid.dev';
const DEFAULT_TITLE = 'Abu Bin Oalid · Senior Backend Engineer';
const MAX_DESCRIPTION = 160;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
  return raw.replace(/\/+$/, '');
}

const absolute = (path: string) => `${siteUrl()}${path}`;

/** Trim to ≤ 160 chars at a word boundary, ending with an ellipsis when cut. */
export function truncateDescription(text: string, max = MAX_DESCRIPTION): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:-]+$/, '')}…`;
}

export function buildMetadata(input: {
  title?: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
}): Metadata {
  const { title, description, path, image, type = 'website' } = input;
  const url = absolute(path);
  const images = image ? [{ url: image }] : undefined;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url },
    openGraph: {
      title: title ? `${title} · Abu Bin Oalid` : DEFAULT_TITLE,
      description,
      url,
      type,
      siteName: 'Abu Bin Oalid',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} · Abu Bin Oalid` : DEFAULT_TITLE,
      description,
      ...(images ? { images } : {}),
    },
  };
}

const PROFILE_SOCIALS = new Set(['github', 'linkedin']);

function personNode(profile: Profile): Exclude<Person, string> {
  return {
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.summary,
    url: absolute('/'),
    image: absolute(profile.avatar),
    sameAs: profile.socials.filter((s) => PROFILE_SOCIALS.has(s.icon)).map((s) => s.url),
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
  };
}

export function personJsonLd(profile: Profile): WithContext<Person> {
  return { '@context': 'https://schema.org', ...personNode(profile) };
}

export function profilePageJsonLd(profile: Profile): WithContext<ProfilePage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absolute('/'),
    mainEntity: personNode(profile),
  };
}

export function projectJsonLd(meta: ProjectFrontmatter): WithContext<CreativeWork> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: meta.title,
    description: meta.summary,
    url: absolute(`/projects/${meta.slug}`),
    dateCreated: String(meta.year),
    keywords: meta.tech.join(', '),
    ...(meta.cover ? { image: absolute(meta.cover) } : {}),
  };
}

export function postJsonLd(meta: PostFrontmatter): WithContext<BlogPosting> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.summary,
    url: absolute(`/blog/${meta.slug}`),
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt ?? meta.publishedAt,
    keywords: meta.tags.join(', '),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absolute(it.path),
    })),
  };
}
