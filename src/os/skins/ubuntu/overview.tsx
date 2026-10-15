'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { ALL_APP_IDS, apps } from '@/os/core/apps';
import { BackToClassic } from '@/os/core/back-to-classic';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import { useDismiss } from '@/os/core/desktop/use-dismiss';
import { OsSwitcher } from '@/os/core/os-switcher';
import type { AppId } from '@/os/core/types';
import { AppIcon } from './icons';
import { OVERVIEW_ID, OVERVIEW_TOGGLE, useOverview } from './overview-state';

const PILL =
  'flex h-9 items-center gap-2 rounded-full bg-(--ubu-button) px-4 text-[14px] font-medium text-(--os-fg) outline-none transition-colors hover:bg-(--ubu-button-hover) focus-visible:ring-2 focus-visible:ring-(--ubu-orange)';

/**
 * The Activities overview: a dimmed, blurred layer over the work area (top bar and dock stay
 * usable) with every app in a centred grid, plus the way to other OSes and the classic site.
 */
export function Overview({ api }: { api: DesktopApi }) {
  const { open, setOpen } = useOverview();
  if (!open) return null;
  return (
    <OverviewPanel
      onLaunch={(id) => {
        setOpen(false);
        api.openApp(id);
      }}
      onClose={() => setOpen(false)}
    />
  );
}

function OverviewPanel({ onLaunch, onClose }: { onLaunch(id: AppId): void; onClose(): void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const switcherId = useId();

  // Where focus returns on Escape: whatever was focused when the overview opened.
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, []);

  useDismiss(ref, {
    ignore: (target) => target instanceof Element && target.closest(`[${OVERVIEW_TOGGLE}]`) !== null,
    onClose: (reason) => {
      onClose();
      if (reason === 'escape') opener.current?.focus({ preventScroll: true });
    },
  });

  return (
    <div
      ref={ref}
      id={OVERVIEW_ID}
      role="group"
      aria-label="Activities overview"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="ubu-blur ubu-overview-in fixed top-8 right-0 bottom-0 left-16 flex flex-col items-center justify-center gap-10 overflow-auto bg-(--ubu-overview) p-8"
    >
      <ul className="ubu-grid-in grid grid-cols-4 gap-x-6 gap-y-4">
        {ALL_APP_IDS.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onLaunch(id)}
              className="flex w-32 flex-col items-center gap-2.5 rounded-2xl px-2 pt-4 pb-3 text-[14px] text-(--os-fg) outline-none transition-colors hover:bg-(--ubu-dock-hover) focus-visible:bg-(--ubu-dock-hover) focus-visible:ring-2 focus-visible:ring-(--ubu-orange)"
            >
              <AppIcon app={apps[id].icon} className="size-[72px]" />
              {apps[id].title}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-expanded={switching}
            aria-controls={switcherId}
            onClick={() => setSwitching((s) => !s)}
            className={PILL}
          >
            Switch OS
            <ChevronDown aria-hidden size={15} strokeWidth={2.4} className={`transition-transform ${switching ? 'rotate-180' : ''}`} />
          </button>
          <BackToClassic className={PILL} />
        </div>
        {switching && (
          <div
            id={switcherId}
            className="w-64 rounded-2xl border border-(--ubu-panel-stroke) bg-(--ubu-panel) p-1.5 text-[14px] shadow-[0_8px_30px_rgb(0_0_0/0.5)] [&_a]:rounded-lg [&_a]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-(--ubu-orange) [&_a[aria-current=page]]:text-(--ubu-orange-hover)"
          >
            <OsSwitcher current="ubuntu" variant="menu" />
          </div>
        )}
      </div>
    </div>
  );
}
