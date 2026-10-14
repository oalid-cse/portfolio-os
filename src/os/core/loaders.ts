import type { ComponentType } from 'react';
import type { OsId, OsRootProps } from './types';

type SkinModule = { default: ComponentType<OsRootProps> };

export const skinLoaders: Record<OsId, () => Promise<SkinModule>> = {
  windows11: () => import('../skins/windows11'),
  macos: () => import('../skins/macos'),
  iphone: () => import('../skins/iphone'),
  windows10: () => import('../skins/windows10'),
  windows7: () => import('../skins/windows7'),
  windowsxp: () => import('../skins/windowsxp'),
  ubuntu: () => import('../skins/ubuntu'),
};
