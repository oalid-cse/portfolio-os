import { describe, expect, it } from 'vitest';
import { formatDateRange, formatDuration } from './format';

describe('formatDateRange', () => {
  it('formats a closed range', () => {
    expect(formatDateRange('2025-03', '2026-03')).toBe('Mar 2025 – Mar 2026');
  });
  it('formats an open range', () => {
    expect(formatDateRange('2020-10', 'present')).toBe('Oct 2020 – Present');
  });
  it('formats a year-only end with no start', () => {
    expect(formatDateRange(undefined, '2013')).toBe('2013');
  });
  it('formats a year-only range', () => {
    expect(formatDateRange('2013', '2017')).toBe('2013 – 2017');
  });
});

describe('formatDuration', () => {
  it('counts both months inclusively', () => {
    expect(formatDuration('2025-03', '2026-03')).toBe('1 yr 1 mo');
    expect(formatDuration('2020-10', '2025-02')).toBe('4 yrs 5 mos');
  });
  it('omits a zero part', () => {
    expect(formatDuration('2020-01', '2020-12')).toBe('1 yr');
    expect(formatDuration('2020-01', '2020-05')).toBe('5 mos');
  });
  it('uses now for present', () => {
    expect(formatDuration('2025-01', 'present', new Date(2025, 0, 15))).toBe('1 mo');
  });
});
