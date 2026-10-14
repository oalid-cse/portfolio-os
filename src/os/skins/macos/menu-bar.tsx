'use client';

import { BatteryFull, Search, Wifi } from 'lucide-react';
import { useRef, useState } from 'react';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import { useMinuteClock } from '@/os/core/use-minute-clock';
import { SystemGlyph } from './icons';
import { SystemMenu } from './system-menu';

/** Shown in place of an app name when no window is focused. */
export const DEFAULT_TITLE = 'Portfolio';

const clockFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

function MenuClock() {
  const now = useMinuteClock();
  if (now === null) return <span className="w-28" />;
  return (
    <time dateTime={now.toISOString()} className="px-2 tabular-nums">
      {clockFormat.format(now).replace(/,/g, '')}
    </time>
  );
}

const BAR_ITEM = 'flex h-[22px] items-center rounded-[4px] px-2.5';

export function MenuBar({ api }: { api: DesktopApi }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const focused = api.windows.find((w) => w.id === api.focusedId && w.mode !== 'minimized');

  return (
    <section
      aria-label="Menu bar"
      className="relative isolate flex h-full items-center justify-between px-2 text-[13px] text-(--os-fg) [text-shadow:0_0.5px_1px_rgb(0_0_0/0.25)]"
    >
      {/* Vibrancy lives on a sibling layer: a backdrop-filter on the bar itself would become the
          system menu's backdrop root and stop the menu from blurring the desktop. */}
      <div aria-hidden className="mac-vibrancy absolute inset-0 -z-10 bg-(--mac-menubar)" />
      <div className="relative flex items-center">
        <button
          ref={button}
          type="button"
          aria-label="System menu"
          title="System menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`${BAR_ITEM} outline-none hover:bg-(--mac-hover) focus-visible:bg-(--mac-hover) ${open ? 'bg-(--mac-hover)' : ''}`}
        >
          <SystemGlyph className="size-[15px]" />
        </button>
        {open && (
          <SystemMenu
            ignoreRef={button}
            onAbout={() => {
              setOpen(false);
              api.openApp('about');
            }}
            onClose={(restoreFocus) => {
              setOpen(false);
              if (restoreFocus) button.current?.focus();
            }}
          />
        )}
        <span data-testid="active-app" className={`${BAR_ITEM} font-bold`}>
          {focused?.title ?? DEFAULT_TITLE}
        </span>
      </div>
      <div className="flex items-center">
        <span aria-hidden className="flex items-center gap-4 px-2.5">
          <BatteryFull size={18} strokeWidth={1.6} />
          <Wifi size={15} strokeWidth={2} />
          <Search size={14} strokeWidth={2.2} />
        </span>
        <MenuClock />
      </div>
    </section>
  );
}
