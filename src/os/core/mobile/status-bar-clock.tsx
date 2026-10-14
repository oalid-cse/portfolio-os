'use client';

import { useMinuteClock } from '../use-minute-clock';

const format = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

/** Phone status-bar time ("9:41", no day period), updated each minute, rendered only on the client. */
export function StatusBarClock({ className }: { className?: string }) {
  const now = useMinuteClock();
  if (now === null) return <span className={className} />;
  const text = format
    .formatToParts(now)
    .filter((p) => p.type !== 'dayPeriod')
    .map((p) => p.value)
    .join('')
    .trim();
  return (
    <time dateTime={now.toISOString()} className={className}>
      {text}
    </time>
  );
}
