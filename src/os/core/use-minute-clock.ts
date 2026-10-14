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

/**
 * The current time, truncated to the minute and updated at each minute boundary.
 * `null` on the server and during hydration: skins render a placeholder until the client knows.
 */
export function useMinuteClock(): Date | null {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute);
  return minute === null ? null : new Date(minute * MINUTE);
}
