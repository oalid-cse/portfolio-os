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

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

/** Link styled as a button. Internal routes use next/link; plain files and external URLs still work. */
export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
