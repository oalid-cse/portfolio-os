'use client';

import { type ComponentType, lazy, Suspense } from 'react';
import type { PortfolioData } from '@/content/types';
import { skinLoaders } from './loaders';
import type { OsId, OsRootProps } from './types';

// Created once per id at module level so the lazy component keeps a stable identity.
const lazySkins: Record<OsId, ComponentType<OsRootProps>> = {
  windows11: lazy(skinLoaders.windows11),
  macos: lazy(skinLoaders.macos),
  iphone: lazy(skinLoaders.iphone),
};

function FullScreenLoader() {
  return (
    <div
      role="status"
      className="flex h-dvh w-full items-center justify-center gap-3 bg-neutral-950 text-neutral-300"
    >
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-200 motion-reduce:animate-none"
      />
      <span>Loading…</span>
    </div>
  );
}

export function OsHost({ id, data }: { id: OsId; data: PortfolioData }) {
  const Skin = lazySkins[id];
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Skin data={data} />
    </Suspense>
  );
}
