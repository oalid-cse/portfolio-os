import type { ComponentType } from 'react';
import type { OsId, OsRootProps } from './types';

type SkinModule = { default: ComponentType<OsRootProps> };

export const skinLoaders: Record<OsId, () => Promise<SkinModule>> = {
  windows11: () => import('../skins/windows11'),
  macos: () => import('../skins/macos'),
  iphone: () => import('../skins/iphone'),
};
