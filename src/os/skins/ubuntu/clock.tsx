'use client';

import { useMinuteClock } from '@/os/core/use-minute-clock';

const parts = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** GNOME's centred clock, e.g. `Thu 15 Oct 14:05`. */
export function formatGnomeClock(date: Date): string {
  const p = Object.fromEntries(parts.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${p.weekday} ${p.day} ${p.month} ${p.hour}:${p.minute}`;
}

export function Clock() {
  const now = useMinuteClock();
  if (now === null) return <span className="w-32" />;
  return (
    <time dateTime={now.toISOString()} className="tabular-nums">
      {formatGnomeClock(now)}
    </time>
  );
}
