import type { ReactNode } from 'react';

export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-8 flex items-center gap-4 text-2xl font-semibold tracking-tight">
      <span className="font-mono text-accent" aria-hidden>
        #
      </span>
      {children}
      <span aria-hidden className="h-px flex-1 bg-border" />
    </h2>
  );
}
