'use client';

import { ChevronRight, Power } from 'lucide-react';
import Image from 'next/image';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { ALL_APP_IDS, apps } from '@/os/core/apps';
import { BackToClassic } from '@/os/core/back-to-classic';
import { useDismiss } from '@/os/core/desktop/use-dismiss';
import { OsSwitcher } from '@/os/core/os-switcher';
import type { AppId } from '@/os/core/types';
import { AppGem } from './icons';

export type StartMenuProps = {
  data: PortfolioData;
  onLaunch(id: AppId): void;
  /** `restoreFocus` is true when the menu was dismissed from the keyboard. */
  onClose(restoreFocus: boolean): void;
  /** Clicks inside this element (the Start orb) are not "outside" clicks. */
  ignoreRef: RefObject<HTMLElement | null>;
};

const FOCUS = 'outline-none focus-visible:outline-1 focus-visible:outline-offset-0';

export function StartMenu({ data, onLaunch, onClose, ignoreRef }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const switcherId = useId();
  const { profile } = data;

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  }, []);

  useDismiss(ref, { ignoreRef, onClose: (reason) => onClose(reason === 'escape') });

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Start"
      className="w7-shell w7-start-in absolute bottom-full left-0 mb-px flex h-[min(470px,calc(100dvh-64px))] w-[460px]"
    >
      <div aria-hidden className="w7-glass w7-start-frame pointer-events-none absolute inset-0 -z-10 rounded-t-lg" />

      <div className="w7-programs my-2 ml-2 flex min-h-0 w-[250px] shrink-0 flex-col rounded-[4px]">
        <ul aria-label="All apps" className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
          {ALL_APP_IDS.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                data-autofocus={i === 0 ? '' : undefined}
                onClick={() => onLaunch(id)}
                className={`w7-program flex h-[42px] w-full items-center gap-2.5 rounded-[3px] border border-transparent px-1.5 text-left text-[13px] ${FOCUS}`}
              >
                <AppGem app={apps[id].icon} size="list" />
                {apps[id].title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col px-2 pt-14 pb-3">
        <span className="w7-avatar absolute -top-6 left-1/2 -translate-x-1/2 rounded-md p-[5px]">
          <Image src={profile.avatar} alt="" width={52} height={52} className="size-[52px] rounded-[3px] object-cover" />
        </span>
        <p className="w7-place truncate px-2.5 py-1.5 text-[13px] font-semibold">{profile.name}</p>
        <span aria-hidden className="w7-separator mx-2 my-1.5 h-px" />
        <button
          type="button"
          aria-expanded={switching}
          aria-controls={switcherId}
          onClick={() => setSwitching((s) => !s)}
          data-open={switching || undefined}
          className={`w7-place flex items-center justify-between rounded-[3px] border border-transparent px-2.5 py-1.5 text-left text-[13px] ${FOCUS}`}
        >
          Switch OS
          <ChevronRight aria-hidden size={14} strokeWidth={2} />
        </button>

        <span className="relative mt-auto ml-auto block">
          <Power aria-hidden size={14} strokeWidth={2.25} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2" />
          <BackToClassic className={`w7-shutdown block rounded-[3px] py-1 pr-3 pl-8 text-[13px] whitespace-nowrap ${FOCUS}`} />
        </span>
      </div>

      {switching && (
        <div id={switcherId} className="w7-flyout absolute top-[86px] left-[calc(100%-6px)] rounded-[3px] p-1 [&_li]:whitespace-nowrap">
          <OsSwitcher current="windows7" variant="menu" />
        </div>
      )}
    </div>
  );
}
