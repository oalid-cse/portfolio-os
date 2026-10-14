import type { Metadata } from 'next';
import { PostList } from '@/components/site/post-list';
import { getPosts } from '@/lib/content';

export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <section className="mx-auto w-full max-w-3xl py-16">
      <h1 className="mb-10 text-4xl font-semibold tracking-tight">Blog</h1>
      <PostList posts={posts} />
    </section>
  );
}
