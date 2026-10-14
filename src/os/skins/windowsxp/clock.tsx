'use client';

import { useMinuteClock } from '@/os/core/use-minute-clock';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });

/** Single-line notification-area clock, with the full date as a tooltip. Client-only. */
export function TrayClock() {
  const now = useMinuteClock();
  if (now === null) return <span className="w-12" />;
  return (
    <time dateTime={now.toISOString()} title={dateFormat.format(now)} className="text-[11px] whitespace-nowrap tabular-nums">
      {timeFormat.format(now)}
    </time>
  );
}
