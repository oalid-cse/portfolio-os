'use client';

import { useMinuteClock } from '@/os/core/use-minute-clock';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });

/** System tray clock: time over date, updated each minute, rendered only on the client. */
export function TrayClock() {
  const now = useMinuteClock();
  if (now === null) return <span className="w-16" />;
  return (
    <time dateTime={now.toISOString()} className="flex flex-col items-end justify-center text-xs leading-[1.35] tabular-nums">
      <span>{timeFormat.format(now)}</span>
      <span>{dateFormat.format(now)}</span>
    </time>
  );
}
