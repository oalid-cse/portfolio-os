'use client';

import { BatteryFull, Power, Volume2, Wifi } from 'lucide-react';
import { Clock } from './clock';
import { OVERVIEW_TOGGLE, useOverview } from './overview-state';

const PILL = 'flex h-6 items-center rounded-full px-3 outline-none transition-colors duration-100';

/** GNOME's top bar: Activities on the left, the clock centred, system status on the right. */
export function TopBar() {
  const { open, setOpen } = useOverview();
  return (
    <section
      aria-label="Top bar"
      className="relative flex h-full items-center justify-between bg-(--ubu-topbar) px-1.5 text-[14px] font-medium text-(--os-fg)"
    >
      <button
        type="button"
        {...{ [OVERVIEW_TOGGLE]: '' }}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${PILL} hover:bg-(--ubu-topbar-hover) focus-visible:bg-(--ubu-topbar-hover) ${open ? 'bg-(--ubu-topbar-active)' : ''}`}
      >
        Activities
      </button>
      <div className={`${PILL} absolute left-1/2 -translate-x-1/2 hover:bg-(--ubu-topbar-hover)`}>
        <Clock />
      </div>
      <div aria-hidden className={`${PILL} gap-3 hover:bg-(--ubu-topbar-hover)`}>
        <Wifi size={15} strokeWidth={2.2} />
        <Volume2 size={15} strokeWidth={2.2} />
        <BatteryFull size={17} strokeWidth={2} />
        <Power size={14} strokeWidth={2.4} />
      </div>
    </section>
  );
}
