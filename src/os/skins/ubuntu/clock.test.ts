import { describe, expect, it } from 'vitest';
import { formatGnomeClock } from './clock';

describe('formatGnomeClock', () => {
  it('formats like the GNOME top bar', () => {
    expect(formatGnomeClock(new Date(2026, 9, 15, 14, 5))).toBe('Thu 15 Oct 14:05');
    expect(formatGnomeClock(new Date(2026, 0, 4, 9, 0))).toBe('Sun 4 Jan 09:00');
  });
});
