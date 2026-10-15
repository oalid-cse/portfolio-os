'use client';

import { useEffect } from 'react';
import { ButtonLink } from '@/components/ui/button';

const BUTTON =
  'inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90';

/** Shown when a skin fails to load (typically its lazy chunk failed to download). */
export default function OsError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-5 text-center">
      <h1 className="text-xl font-semibold">Couldn&apos;t load this OS.</h1>
      <div className="flex flex-wrap justify-center gap-3">
        {/* A full reload, not `retry()`/`reset()`: React.lazy caches a rejected chunk import for the
            life of the page, so re-rendering in place would fail again. */}
        <button type="button" onClick={() => window.location.reload()} className={BUTTON}>
          Retry
        </button>
        <ButtonLink href="/" variant="secondary">
          Back to classic view
        </ButtonLink>
      </div>
    </div>
  );
}
