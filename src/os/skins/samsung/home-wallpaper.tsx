'use client';

import { useMinuteClock } from '@/os/core/use-minute-clock';

const time = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const date = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

/** The home background: the original wallpaper with a large clock widget (decorative; the status bar has the time). */
export function HomeWallpaper() {
  const now = useMinuteClock();
  const clock = now
    ? time
        .formatToParts(now)
        .filter((p) => p.type !== 'dayPeriod')
        .map((p) => p.value)
        .join('')
        .trim()
    : '';
  return (
    <div className="oneui-wallpaper absolute inset-0">
      <div aria-hidden className="oneui-widget">
        <p className="oneui-widget-time">{clock}</p>
        <p className="oneui-widget-date">{now ? date.format(now) : ''}</p>
      </div>
    </div>
  );
}
