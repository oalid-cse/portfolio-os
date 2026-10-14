import type { Metadata } from 'next';
import { PostList } from '@/components/site/post-list';
import { JsonLd } from '@/components/site/json-ld';
import { getPosts, getProfile } from '@/lib/content';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { name } = await getProfile();
  return buildMetadata({
    title: 'Blog',
    description: `Articles by ${name} on backend engineering, Laravel and system design.`,
    path: '/blog',
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <section className="mx-auto w-full max-w-3xl py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }])} />
      <h1 className="mb-10 text-4xl font-semibold tracking-tight">Blog</h1>
      <PostList posts={posts} />
    </section>
  );
}
