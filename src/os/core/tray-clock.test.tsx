import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { TrayClock } from './tray-clock';

const NOW = new Date(2026, 9, 15, 14, 5, 30);

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
  vi.setSystemTime(NOW);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const minute = new Date(2026, 9, 15, 14, 5, 0);
const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(minute);

describe('TrayClock', () => {
  it('stacked: time over numeric date, with the given classes', () => {
    const { container } = render(<TrayClock className="tray" />);
    const el = container.querySelector('time');
    expect(el).toHaveClass('tray');
    expect(el).toHaveAttribute('dateTime', minute.toISOString());
    const [t, d] = [...(el?.querySelectorAll('span') ?? [])];
    expect(t).toHaveTextContent(time);
    expect(d).toHaveTextContent(new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' }).format(minute));
  });

  it('inline: time only, full date as a tooltip', () => {
    const { container } = render(<TrayClock variant="inline" className="xp" />);
    const el = container.querySelector('time');
    expect(el).toHaveClass('xp');
    expect(el).toHaveTextContent(time);
    expect(el?.querySelector('span')).toBeNull();
    expect(el).toHaveAttribute('title', new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(minute));
  });
});
