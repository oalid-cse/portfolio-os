'use client';

import { ChevronRight, LayoutGrid, Monitor, X } from 'lucide-react';
import Image from 'next/image';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { apps } from '@/os/core/apps';
import { BackToClassic } from '@/os/core/back-to-classic';
import { OsSwitcher } from '@/os/core/os-switcher';
import type { AppId } from '@/os/core/types';
import { AppTile } from './icons';

export type StartMenuProps = {
  data: PortfolioData;
  onLaunch(id: AppId): void;
  /** `restoreFocus` is true when the menu was dismissed from the keyboard. */
  onClose(restoreFocus: boolean): void;
  /** Clicks inside this element (the start button) are not "outside" clicks. */
  ignoreRef: RefObject<HTMLElement | null>;
};

const PROGRAMS: AppId[] = ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser'];

const FOCUS = 'outline-none focus-visible:outline-1 focus-visible:outline-dotted focus-visible:-outline-offset-2';

export function StartMenu({ data, onLaunch, onClose, ignoreRef }: StartMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const switcherId = useId();
  const { profile } = data;

  // Latest onClose without re-subscribing (the parent passes a fresh closure each render).
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || ignoreRef.current?.contains(target)) return;
      close.current(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ignoreRef]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Start"
      className="xp-start-menu xp-start-in absolute bottom-full left-0 flex max-h-[calc(100dvh-30px)] w-[400px] flex-col rounded-t-[8px]"
    >
      <div className="xp-menu-header flex shrink-0 items-center gap-2.5 rounded-t-[7px] px-2 py-1.5">
        <Image src={profile.avatar} alt="" width={44} height={44} className="xp-menu-avatar size-11 rounded-[3px] object-cover" />
        <p className="truncate text-[15px] font-bold">{profile.name}</p>
      </div>
      <span aria-hidden className="xp-menu-rule h-[2px] shrink-0" />

      <div className="flex min-h-0 flex-1">
        <ul aria-label="All apps" className="xp-menu-left min-h-0 w-[210px] shrink-0 overflow-y-auto px-1 py-1.5 [scrollbar-width:thin]">
          {PROGRAMS.map((id, i) => (
            <li key={id}>
              <button
                type="button"
                data-autofocus={i === 0 ? '' : undefined}
                onClick={() => onLaunch(id)}
                className={`xp-menu-item flex h-[38px] w-full items-center gap-2 rounded-[2px] px-1.5 text-left text-[12px] ${FOCUS}`}
              >
                <AppTile app={apps[id].icon} size="list" />
                <span className={i < 2 ? 'font-bold' : undefined}>{apps[id].title}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="xp-menu-right flex min-w-0 flex-1 flex-col gap-0.5 px-1 py-1.5">
          <button
            type="button"
            aria-expanded={switching}
            aria-controls={switcherId}
            onClick={() => setSwitching((s) => !s)}
            data-open={switching || undefined}
            className={`xp-place flex h-[32px] items-center gap-2 rounded-[2px] px-1.5 text-left text-[12px] font-bold ${FOCUS}`}
          >
            <LayoutGrid aria-hidden size={18} strokeWidth={2} className="xp-place-icon" />
            <span className="flex-1">Switch OS</span>
            <ChevronRight aria-hidden size={13} strokeWidth={2.5} />
          </button>
          <span aria-hidden className="xp-menu-divider mx-1 my-1 h-px" />
          <span className="relative block">
            <Monitor aria-hidden size={18} strokeWidth={2} className="xp-place-icon pointer-events-none absolute top-1/2 left-1.5 -translate-y-1/2" />
            <BackToClassic className={`xp-place flex h-[32px] items-center rounded-[2px] pr-1.5 pl-[34px] text-[12px] font-bold whitespace-nowrap ${FOCUS}`} />
          </span>
        </div>
      </div>

      <div className="xp-menu-footer flex h-[38px] shrink-0 items-center justify-end px-2.5">
        <button type="button" onClick={() => onClose(true)} className={`xp-footer-button flex items-center gap-1.5 rounded-[3px] px-1.5 py-1 text-[12px] ${FOCUS}`}>
          <span aria-hidden className="xp-footer-icon flex size-[22px] items-center justify-center rounded-[4px]">
            <X size={14} strokeWidth={3} />
          </span>
          Close menu
        </button>
      </div>

      {switching && (
        <div id={switcherId} className="xp-flyout absolute top-[66px] left-[calc(100%-4px)] p-0.5 [&_li]:whitespace-nowrap">
          <OsSwitcher current="windowsxp" variant="menu" />
        </div>
      )}
    </div>
  );
}
