import { formatPostDate } from '@/lib/format';
import type { AppProps } from './app-props';

export function BrowserApp({ data }: AppProps) {
  return (
    <div className="os-app os-stack">
      <h1>Blog</h1>
      {data.posts.length === 0 ? (
        <p className="os-muted">No posts yet.</p>
      ) : (
        <ul className="os-stack" style={{ gap: '0.5rem' }}>
          {data.posts.map((post) => (
            <li key={post.slug} className="os-card">
              <h2>
                <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                  {post.title}
                </a>
              </h2>
              <p className="os-muted">{formatPostDate(post.publishedAt)}</p>
              <p>{post.summary}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
