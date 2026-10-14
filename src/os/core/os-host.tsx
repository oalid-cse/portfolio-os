'use client';

import { type ComponentType, lazy } from 'react';
import type { PortfolioData } from '@/content/types';
import { skinLoaders } from './loaders';
import type { OsId, OsRootProps } from './types';

/**
 * One lazy component per skin, derived from `skinLoaders` and created once at module level so
 * each keeps a stable identity. Adding a skin never touches this file.
 */
export const lazySkins: Record<OsId, ComponentType<OsRootProps>> = (() => {
  const map: Partial<Record<OsId, ComponentType<OsRootProps>>> = {};
  for (const id of Object.keys(skinLoaders) as OsId[]) map[id] = lazy(skinLoaders[id]);
  return map as Record<OsId, ComponentType<OsRootProps>>;
})();

/**
 * Renders the skin for `id`. Deliberately has no Suspense boundary of its own: the page is
 * prerendered with the skin in its HTML, and React.lazy chunks are not preloaded, so the skin
 * usually suspends during hydration. With a boundary here, any context change above it (e.g.
 * next-themes resolving the system theme on mount) reaches the still-dehydrated boundary, which
 * React can then only client-render: the server HTML is thrown away, the fallback flashes and
 * the skin mounts twice. Without one, hydration of the whole root waits for the chunk and keeps
 * the server HTML on screen; client-side navigations are transitions, so the previous page
 * stays visible until the skin chunk has loaded.
 */
export function OsHost({ id, data }: { id: OsId; data: PortfolioData }) {
  const Skin = lazySkins[id];
  return <Skin data={data} />;
}
