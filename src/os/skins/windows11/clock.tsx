'use client';

import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;

/** Ticks at every minute boundary. */
function subscribe(onTick: () => void) {
  let timer = 0;
  const schedule = () => {
    timer = window.setTimeout(() => {
      onTick();
      schedule();
    }, MINUTE - (Date.now() % MINUTE));
  };
  schedule();
  return () => window.clearTimeout(timer);
}

const currentMinute = () => Math.floor(Date.now() / MINUTE);
/** Unknown on the server, so the server HTML never contains a time that would mismatch. */
const serverMinute = () => null;

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });

/** System tray clock: time over date, updated each minute, rendered only on the client. */
export function TrayClock() {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute);
  if (minute === null) return <span className="w-16" />;
  const now = new Date(minute * MINUTE);
  return (
    <time dateTime={now.toISOString()} className="flex flex-col items-end justify-center text-xs leading-[1.35] tabular-nums">
      <span>{timeFormat.format(now)}</span>
      <span>{dateFormat.format(now)}</span>
    </time>
  );
}
