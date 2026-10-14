'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';

type NavLink = { label: string; href: string; external?: boolean };

export function SiteHeader({ name, resumeHref }: { name: string; resumeHref: string }) {
  const [open, setOpen] = useState(false);
  const links: NavLink[] = [
    { label: 'Projects', href: '/projects' },
    { label: 'Experience', href: '/#experience' },
    { label: 'Blog', href: '/blog' },
    { label: 'Resume', href: resumeHref, external: true },
    { label: 'Contact', href: '/#contact' },
  ];
  const linkCls = 'text-sm text-fg-muted transition-colors hover:text-fg';

  const renderLink = (l: NavLink) =>
    l.external ? (
      <a key={l.label} href={l.href} className={linkCls} onClick={() => setOpen(false)}>
        {l.label}
      </a>
    ) : (
      <Link key={l.label} href={l.href} className={linkCls} onClick={() => setOpen(false)}>
        {l.label}
      </Link>
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
        <Link href="/" className="font-mono text-sm font-medium text-fg">
          {name}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {links.map(renderLink)}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-fg-muted hover:text-fg md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="flex flex-col gap-4 border-t border-border bg-bg px-5 py-4 md:hidden"
        >
          {links.map(renderLink)}
        </nav>
      )}
    </header>
  );
}
