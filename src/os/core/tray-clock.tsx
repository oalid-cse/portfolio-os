'use client';

import { useMinuteClock } from './use-minute-clock';

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const shortDate = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
const fullDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });

export type TrayClockProps = {
  /** `stacked`: time over a numeric date. `inline`: time only, with the full date as a tooltip. */
  variant?: 'stacked' | 'inline';
  /** Classes for the `<time>` element (the skin's alignment, size, leading). */
  className?: string;
  /** Classes for the empty placeholder shown until the client knows the time. */
  placeholderClassName?: string;
};

/** Taskbar notification-area clock, updated each minute and rendered only on the client. */
export function TrayClock({ variant = 'stacked', className, placeholderClassName = 'w-16' }: TrayClockProps) {
  const now = useMinuteClock();
  if (now === null) return <span className={placeholderClassName} />;
  if (variant === 'inline') {
    return (
      <time dateTime={now.toISOString()} title={fullDate.format(now)} className={className}>
        {timeFormat.format(now)}
      </time>
    );
  }
  return (
    <time dateTime={now.toISOString()} className={className}>
      <span>{timeFormat.format(now)}</span>
      <span>{shortDate.format(now)}</span>
    </time>
  );
}
