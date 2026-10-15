// Metadata only: no skin or React imports. The classic-site banner imports this.
import type { DetectedOs } from '@/lib/os-detect';
import type { OsId, OsSkinMeta } from './types';

export const skins: readonly OsSkinMeta[] = [
  { id: 'windows11', name: 'Windows 11', kind: 'desktop', status: 'ready' },
  { id: 'macos', name: 'macOS', kind: 'desktop', status: 'ready' },
  { id: 'iphone', name: 'iPhone', kind: 'mobile', status: 'ready' },
  { id: 'windows10', name: 'Windows 10', kind: 'desktop', status: 'ready' },
  { id: 'windows7', name: 'Windows 7', kind: 'desktop', status: 'ready' },
  { id: 'windowsxp', name: 'Windows XP', kind: 'desktop', status: 'ready' },
  { id: 'ubuntu', name: 'Ubuntu', kind: 'desktop', status: 'ready' },
  { id: 'samsung', name: 'Samsung One UI', kind: 'mobile', status: 'ready' },
];

export function getSkinMeta(id: string): OsSkinMeta | undefined {
  return skins.find((s) => s.id === id);
}

export function isReadyOsId(id: string): id is OsId {
  return getSkinMeta(id)?.status === 'ready';
}

const SUGGESTED_ID: Partial<Record<DetectedOs, string>> = {
  windows11: 'windows11',
  windows10: 'windows10',
  windows: 'windows11',
  macos: 'macos',
  ipad: 'macos',
  iphone: 'iphone',
  samsung: 'samsung',
  android: 'samsung',
  linux: 'ubuntu',
};

export function suggestSkinFor(detected: DetectedOs): OsSkinMeta | null {
  const id = SUGGESTED_ID[detected];
  const meta = id ? getSkinMeta(id) : undefined;
  return meta?.status === 'ready' ? meta : null;
}
