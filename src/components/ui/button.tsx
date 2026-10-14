import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors';
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-accent-fg hover:opacity-90',
  secondary: 'border border-border bg-bg-elevated text-fg hover:border-fg-muted',
  ghost: 'text-fg-muted hover:text-fg',
};

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string; variant?: Variant };

const isHttp = (href: string) => /^https?:\/\//i.test(href);
const usesPlainAnchor = (href: string) => isHttp(href) || /^mailto:/i.test(href) || /\.pdf($|[?#])/i.test(href);

/** Link styled as a button. Internal routes use next/link; external URLs, mailto and PDFs use a plain <a>. */
export function ButtonLink({ variant = 'primary', className, href, ...props }: ButtonLinkProps) {
  const classes = cn(base, variants[variant], className);
  if (usesPlainAnchor(href)) {
    const { children, download } = props;
    const external = isHttp(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return (
      <a href={href} className={classes} download={download} {...external}>
        {children}
      </a>
    );
  }
  return <Link href={href} className={classes} {...props} />;
}
