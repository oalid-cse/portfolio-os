import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeStorage } from './safe-storage';

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('safeStorage', () => {
  it('round-trips local and session values', () => {
    safeStorage.set('a', '1');
    safeStorage.set('b', '2', 'session');
    expect(safeStorage.get('a')).toBe('1');
    expect(safeStorage.get('b', 'session')).toBe('2');
    expect(window.localStorage.getItem('b')).toBeNull();
  });

  it('returns null for missing keys', () => {
    expect(safeStorage.get('nope')).toBeNull();
  });

  it('swallows errors from get and set', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(safeStorage.get('a')).toBeNull();
    expect(() => safeStorage.set('a', '1')).not.toThrow();
  });
});
