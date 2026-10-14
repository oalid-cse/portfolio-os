import { describe, expect, it } from 'vitest';
import type { DetectedOs } from '@/lib/os-detect';
import { getSkinMeta, isReadyOsId, skins, suggestSkinFor } from './registry';

describe('suggestSkinFor', () => {
  it.each([
    ['windows11', 'windows11'],
    ['windows10', 'windows10'],
    ['windows', 'windows11'],
    ['macos', 'macos'],
    ['ipad', 'macos'],
    ['iphone', 'iphone'],
    ['linux', 'ubuntu'],
  ] as const)('%s -> %s', (detected, id) => {
    expect(suggestSkinFor(detected)?.id).toBe(id);
  });

  it.each(['android', 'samsung', 'unknown'] as const satisfies readonly DetectedOs[])(
    '%s -> null while its skin is coming soon',
    (detected) => {
      expect(suggestSkinFor(detected)).toBeNull();
    },
  );
});

describe('registry', () => {
  it('isReadyOsId only accepts ready skins', () => {
    expect(isReadyOsId('windows11')).toBe(true);
    expect(isReadyOsId('macos')).toBe(true);
    expect(isReadyOsId('iphone')).toBe(true);
    expect(isReadyOsId('windows10')).toBe(true);
    expect(isReadyOsId('windows7')).toBe(true);
    expect(isReadyOsId('windowsxp')).toBe(true);
    expect(isReadyOsId('ubuntu')).toBe(true);
    expect(isReadyOsId('samsung')).toBe(false);
    expect(isReadyOsId('nope')).toBe(false);
  });

  it('ready ids are unique and coming-soon entries are listed', () => {
    const ready = skins.filter((s) => s.status === 'ready').map((s) => s.id);
    expect(new Set(ready).size).toBe(ready.length);
    expect(ready).toEqual(['windows11', 'macos', 'iphone', 'windows10', 'windows7', 'windowsxp', 'ubuntu']);
    expect(skins.filter((s) => s.status === 'coming-soon').map((s) => s.id)).toEqual(['samsung']);
  });

  it('getSkinMeta looks up by id', () => {
    expect(getSkinMeta('macos')).toMatchObject({ name: 'macOS', kind: 'desktop' });
    expect(getSkinMeta('iphone')?.kind).toBe('mobile');
    expect(getSkinMeta('windows10')).toMatchObject({ name: 'Windows 10', kind: 'desktop' });
    expect(getSkinMeta('windows7')).toMatchObject({ name: 'Windows 7', kind: 'desktop' });
    expect(getSkinMeta('windowsxp')).toMatchObject({ name: 'Windows XP', kind: 'desktop' });
    expect(getSkinMeta('ubuntu')).toMatchObject({ name: 'Ubuntu', kind: 'desktop' });
    expect(getSkinMeta('samsung')?.kind).toBe('mobile');
    expect(getSkinMeta('missing')).toBeUndefined();
  });
});
