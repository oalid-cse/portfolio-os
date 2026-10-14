import Link from 'next/link';
import type { PostFrontmatter } from '@/content/types';
import { Badge } from '@/components/ui/badge';
import { formatPostDate } from '@/lib/format';

export function PostList({ posts }: { posts: PostFrontmatter[] }) {
  if (posts.length === 0) {
    return <p className="text-fg-muted">No posts yet. Check back soon.</p>;
  }
  return (
    <ul className="space-y-10">
      {posts.map((post) => (
        <li key={post.slug}>
          <article className="space-y-2">
            <time dateTime={post.publishedAt} className="font-mono text-sm text-fg-muted">
              {formatPostDate(post.publishedAt)}
            </time>
            <h2 className="text-2xl font-semibold tracking-tight">
              <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                {post.title}
              </Link>
            </h2>
            <p className="text-fg-muted">{post.summary}</p>
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
