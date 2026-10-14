import type { MetadataRoute } from 'next';
import { getPosts, getProjects } from '@/lib/content';
import { siteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getProjects(), getPosts()]);
  const base = siteUrl();
  return [
    { url: `${base}/` },
    { url: `${base}/projects` },
    ...projects.map((p) => ({ url: `${base}/projects/${p.slug}` })),
    { url: `${base}/blog` },
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt ?? p.publishedAt })),
    { url: `${base}/resume` },
  ];
}
