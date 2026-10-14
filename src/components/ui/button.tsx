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
    // Drop Link-only props so they don't reach the DOM; keep everything else (aria-*, id, data-*, ...).
    const { prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, onNavigate, ...anchorProps } =
      props as typeof props & { shallow?: boolean; passHref?: boolean; legacyBehavior?: boolean; locale?: unknown };
    void [prefetch, replace, scroll, shallow, passHref, legacyBehavior, locale, onNavigate];
    const external = isHttp(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    return <a {...(anchorProps as ComponentProps<'a'>)} href={href} className={classes} {...external} />;
  }
  return <Link href={href} className={classes} {...props} />;
}
