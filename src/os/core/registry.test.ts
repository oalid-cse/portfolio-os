import { describe, expect, it } from 'vitest';
import type { DetectedOs } from '@/lib/os-detect';
import { getSkinMeta, isReadyOsId, skins, suggestSkinFor } from './registry';

describe('suggestSkinFor', () => {
  it.each([
    ['windows11', 'windows11'],
    ['windows10', 'windows11'],
    ['windows', 'windows11'],
    ['macos', 'macos'],
    ['ipad', 'macos'],
    ['iphone', 'iphone'],
  ] as const)('%s -> %s', (detected, id) => {
    expect(suggestSkinFor(detected)?.id).toBe(id);
  });

  it.each(['android', 'samsung', 'linux', 'unknown'] as const satisfies readonly DetectedOs[])(
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
    expect(isReadyOsId('ubuntu')).toBe(false);
    expect(isReadyOsId('nope')).toBe(false);
  });

  it('ready ids are unique and coming-soon entries are listed', () => {
    const ready = skins.filter((s) => s.status === 'ready').map((s) => s.id);
    expect(new Set(ready).size).toBe(ready.length);
    expect(ready).toEqual(['windows11', 'macos', 'iphone']);
    expect(skins.filter((s) => s.status === 'coming-soon').map((s) => s.id)).toEqual([
      'windows10',
      'windows7',
      'windowsxp',
      'ubuntu',
      'samsung',
    ]);
  });

  it('getSkinMeta looks up by id', () => {
    expect(getSkinMeta('macos')).toMatchObject({ name: 'macOS', kind: 'desktop' });
    expect(getSkinMeta('iphone')?.kind).toBe('mobile');
    expect(getSkinMeta('samsung')?.kind).toBe('mobile');
    expect(getSkinMeta('missing')).toBeUndefined();
  });
});
