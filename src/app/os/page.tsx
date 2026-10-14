import type { Metadata } from 'next';
import Link from 'next/link';
import { BackToClassic } from '@/os/core/back-to-classic';
import { skins } from '@/os/core/registry';

export const metadata: Metadata = {
  title: 'OS versions',
  description: 'Explore this portfolio inside recreated desktop and phone operating systems.',
};

export default function OsGalleryPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <BackToClassic />
      <h1 className="mt-6 text-3xl font-semibold">OS versions</h1>
      <p className="mt-2 text-fg-muted">Pick an experience to explore this portfolio in.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skins.map((s) => (
          <li key={s.id} className="overflow-hidden rounded-xl border border-border">
            <div
              aria-hidden
              className="flex h-32 items-end bg-gradient-to-br from-neutral-700 to-neutral-950 p-4 text-lg font-semibold text-white"
            >
              {s.name}
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h2 className="font-medium">{s.name}</h2>
                <p className="text-sm text-fg-muted">
                  {s.kind === 'desktop' ? 'Desktop' : 'Mobile'}
                </p>
              </div>
              {s.status === 'ready' ? (
                <Link
                  href={`/os/${s.id}`}
                  className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-fg/10"
                >
                  Open
                </Link>
              ) : (
                <span aria-disabled="true" className="text-sm text-fg-muted opacity-70">
                  Coming soon
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-fg-muted">
        Fan-made recreations for a personal portfolio. Not affiliated with Microsoft, Apple, Samsung, or Canonical.
      </p>
    </div>
  );
}
