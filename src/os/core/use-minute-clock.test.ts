import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useMinuteClock } from './use-minute-clock';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useMinuteClock', () => {
  it('returns the current minute and advances at the next minute boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-15T09:41:30'));
    const { result } = renderHook(() => useMinuteClock());
    expect(result.current?.getMinutes()).toBe(41);
    expect(result.current?.getSeconds()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current?.getMinutes()).toBe(42);
  });
});
