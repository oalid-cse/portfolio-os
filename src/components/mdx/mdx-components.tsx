import type { ComponentProps } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const isExternal = (href: string) => /^https?:\/\//i.test(href);

function MdxLink({ href = '', className, ...props }: ComponentProps<'a'>) {
  const classes = cn('text-accent underline underline-offset-4 hover:opacity-80', className);
  if (isExternal(href)) {
    return <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props} />;
  }
  if (href.startsWith('/')) return <Link href={href} className={classes} {...props} />;
  return <a href={href} className={classes} {...props} />;
}

export const mdxComponents = {
  h2: ({ className, ...p }: ComponentProps<'h2'>) => (
    <h2 className={cn('mt-12 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight', className)} {...p} />
  ),
  h3: ({ className, ...p }: ComponentProps<'h3'>) => (
    <h3 className={cn('mt-8 mb-3 scroll-mt-24 text-lg font-semibold tracking-tight', className)} {...p} />
  ),
  p: ({ className, ...p }: ComponentProps<'p'>) => (
    <p className={cn('my-4 leading-relaxed text-fg-muted', className)} {...p} />
  ),
  ul: ({ className, ...p }: ComponentProps<'ul'>) => (
    <ul className={cn('my-4 list-disc space-y-2 pl-6 text-fg-muted marker:text-accent', className)} {...p} />
  ),
  ol: ({ className, ...p }: ComponentProps<'ol'>) => (
    <ol className={cn('my-4 list-decimal space-y-2 pl-6 text-fg-muted', className)} {...p} />
  ),
  a: MdxLink,
  code: ({ className, ...p }: ComponentProps<'code'>) => (
    <code className={cn('rounded bg-bg-elevated px-1.5 py-0.5 font-mono text-[0.9em] text-fg', className)} {...p} />
  ),
  pre: ({ className, ...p }: ComponentProps<'pre'>) => (
    <pre
      className={cn(
        'my-6 overflow-x-auto rounded-lg border border-border bg-bg-elevated p-4 font-mono text-sm [&_code]:bg-transparent [&_code]:p-0',
        className,
      )}
      {...p}
    />
  ),
  // Plain <img>: MDX images have no known dimensions for next/image.
  img: ({ className, alt = '', ...p }: ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} loading="lazy" className={cn('my-6 h-auto max-w-full rounded-lg border border-border', className)} {...p} />
  ),
};
