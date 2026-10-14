import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { renderMdx } from '@/components/mdx/render-mdx';
import { getPost, getPosts } from '@/lib/content';
import { formatPostDate, readingTime } from '@/lib/format';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return post ? { title: post.meta.title, description: post.meta.summary } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const body = await renderMdx(post.body);
  const { title, publishedAt } = post.meta;
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/blog" className="mb-8 inline-block text-sm text-fg-muted hover:text-fg">
        ← All posts
      </Link>
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="font-mono text-sm text-fg-muted">
          <time dateTime={publishedAt}>{formatPostDate(publishedAt)}</time> · {readingTime(post.body)} min read
        </p>
      </header>
      <div className="mt-10">{body}</div>
    </article>
  );
}
