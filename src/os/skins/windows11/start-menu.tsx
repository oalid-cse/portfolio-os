'use client';

import { ChevronDown, ChevronRight, Power } from 'lucide-react';
import Image from 'next/image';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { ALL_APP_IDS, apps } from '@/os/core/apps';
import { BackToClassic } from '@/os/core/back-to-classic';
import { useDismiss } from '@/os/core/desktop/use-dismiss';
import { OsSwitcher } from '@/os/core/os-switcher';
import type { AppId } from '@/os/core/types';
import { AppTile } from './icons';

export type StartMenuProps = {
  data: PortfolioData;
  onLaunch(id: AppId): void;
  /** `restoreFocus` is true when the menu was dismissed from the keyboard. */
  onClose(restoreFocus: boolean): void;
  /** Clicks on this element (the Start button) are not "outside" clicks; it toggles the menu itself. */
  ignoreRef: RefObject<HTMLElement | null>;
};

const ROW =
  'flex items-center gap-2 rounded-[5px] px-3 py-2 text-sm outline-none transition-colors duration-100 hover:bg-(--w11-hover) active:bg-(--w11-pressed) focus-visible:ring-2 focus-visible:ring-(--os-fg)';

export function StartMenu({ data, onLaunch, onClose, ignoreRef }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const switcherId = useId();
  const { profile } = data;

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, []);

  useDismiss(ref, { ignoreRef, onClose: (reason) => onClose(reason === 'escape') });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Start"
      className="w11-acrylic w11-flyout-in absolute bottom-[calc(100%+12px)] left-1/2 flex max-h-[calc(100dvh-72px)] w-[min(640px,calc(100vw-24px))] flex-col overflow-hidden rounded-lg border border-(--w11-stroke-strong) bg-(--w11-flyout) text-(--os-fg) shadow-(--w11-shadow)"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-8 pt-7 pb-6">
        <h2 className="mb-3 px-3 text-sm font-semibold">Pinned</h2>
        <ul className="grid grid-cols-6 gap-y-2">
          {ALL_APP_IDS.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => onLaunch(id)}
                className="flex h-[84px] w-full flex-col items-center justify-center gap-2 rounded-[5px] text-xs outline-none transition-colors duration-100 hover:bg-(--w11-hover) active:bg-(--w11-pressed) focus-visible:ring-2 focus-visible:ring-(--os-fg)"
              >
                <AppTile app={apps[id].icon} size="start" />
                <span>{apps[id].title}</span>
              </button>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 mb-2 px-3 text-sm font-semibold">Explore</h2>
        <button
          type="button"
          aria-expanded={switching}
          aria-controls={switcherId}
          onClick={() => setSwitching((s) => !s)}
          className={`${ROW} w-full justify-between`}
        >
          <span className="flex flex-col items-start">
            <span>Switch OS</span>
            <span className="text-xs text-(--os-muted)">See this portfolio as another operating system</span>
          </span>
          {switching ? <ChevronDown aria-hidden size={16} /> : <ChevronRight aria-hidden size={16} />}
        </button>
        {switching && (
          <div
            id={switcherId}
            className="mt-1 rounded-[5px] border border-(--w11-stroke) bg-(--w11-layer) p-1.5 [&_ul]:grid [&_ul]:grid-cols-2 [&_ul]:gap-0.5"
          >
            <OsSwitcher current="windows11" variant="menu" />
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-(--w11-stroke) bg-(--w11-flyout-footer) px-8 py-3">
        <div className="flex min-w-0 items-center gap-3 px-3 py-1.5 text-sm">
          <Image
            src={profile.avatar}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full border border-(--w11-stroke-strong) object-cover"
          />
          <span className="truncate">{profile.name}</span>
        </div>
        <span className="relative flex items-center">
          <Power aria-hidden size={16} className="pointer-events-none absolute left-3" />
          <BackToClassic className={`${ROW} pl-9`} />
        </span>
      </div>
    </div>
  );
}
