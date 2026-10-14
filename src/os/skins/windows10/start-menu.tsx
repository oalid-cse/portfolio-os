'use client';

import { MonitorSmartphone, Power } from 'lucide-react';
import Image from 'next/image';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { apps } from '@/os/core/apps';
import { BackToClassic } from '@/os/core/back-to-classic';
import { OsSwitcher } from '@/os/core/os-switcher';
import type { AppId } from '@/os/core/types';
import { AppSquare, appColor, GLYPHS } from './icons';

export type StartMenuProps = {
  data: PortfolioData;
  onLaunch(id: AppId): void;
  /** `restoreFocus` is true when the menu was dismissed from the keyboard. */
  onClose(restoreFocus: boolean): void;
  /** Clicks inside this element (Start button and search box) are not "outside" clicks. */
  ignoreRef: RefObject<HTMLElement | null>;
};

/** Tiles in reading order; About is a wide tile so the group has a Windows-like rhythm. */
const TILES: AppId[] = ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser'];

const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';
const RAIL_ROW = `flex h-12 w-full items-center overflow-hidden whitespace-nowrap text-sm hover:bg-(--w10-shell-hover) active:bg-(--w10-shell-pressed) ${FOCUS}`;

/** All apps grouped under their first letter, as in the Windows 10 app list. */
function groupByLetter(ids: AppId[]) {
  const sorted = [...ids].sort((a, b) => apps[a].title.localeCompare(apps[b].title));
  const groups = new Map<string, AppId[]>();
  for (const id of sorted) {
    const letter = apps[id].title[0]?.toUpperCase() ?? '#';
    groups.set(letter, [...(groups.get(letter) ?? []), id]);
  }
  return [...groups];
}

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

  const groups = groupByLetter(TILES);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Start"
      className="w10-shell w10-acrylic w10-start-in absolute bottom-full left-0 flex h-[min(600px,calc(100dvh-56px))] w-[min(584px,100vw)] bg-(--w10-start) shadow-[0_0_24px_rgb(0_0_0/0.5)]"
    >
      {/* Rail: collapsed to icons, it widens over the app list on hover or keyboard focus. */}
      <div
        className={`absolute inset-y-0 left-0 z-10 flex flex-col justify-end overflow-hidden transition-[width,background-color] duration-150 motion-reduce:transition-none ${
          switching
            ? 'w-72 bg-(--w10-flyout) shadow-[4px_0_16px_rgb(0_0_0/0.4)]'
            : 'w-12 delay-0 hover:w-60 hover:bg-(--w10-flyout) hover:shadow-[4px_0_16px_rgb(0_0_0/0.4)] hover:delay-300 focus-within:w-60 focus-within:bg-(--w10-flyout)'
        }`}
      >
        {switching && (
          <div id={switcherId} className="min-h-0 overflow-y-auto border-b border-(--w10-shell-stroke) py-2 pr-2 pl-11 [&_li]:whitespace-nowrap">
            <OsSwitcher current="windows10" variant="menu" />
          </div>
        )}
        <div className={`${RAIL_ROW} cursor-default hover:bg-transparent active:bg-transparent`}>
          <span className="flex w-12 shrink-0 justify-center">
            <Image src={profile.avatar} alt="" width={28} height={28} className="size-7 rounded-full object-cover" />
          </span>
          <span className="truncate pr-3">{profile.name}</span>
        </div>
        <button
          type="button"
          aria-expanded={switching}
          aria-controls={switcherId}
          onClick={() => setSwitching((s) => !s)}
          className={RAIL_ROW}
        >
          <span className="flex w-12 shrink-0 justify-center">
            <MonitorSmartphone aria-hidden size={18} strokeWidth={1.5} />
          </span>
          Switch OS
        </button>
        <span className="relative block">
          <Power aria-hidden size={18} strokeWidth={1.5} className="pointer-events-none absolute top-1/2 left-[15px] -translate-y-1/2" />
          <BackToClassic className={`${RAIL_ROW} pl-12`} />
        </span>
      </div>

      <div className="min-h-0 w-[248px] shrink-0 overflow-y-auto py-2 pl-12 [scrollbar-width:thin]">
        <ul aria-label="All apps">
          {groups.map(([letter, ids], g) => (
            <li key={letter}>
              <span aria-hidden className="flex h-8 items-center px-3 text-sm text-(--w10-shell-muted)">
                {letter}
              </span>
              <ul>
                {ids.map((id, i) => (
                  <li key={id}>
                    <button
                      type="button"
                      data-autofocus={g === 0 && i === 0 ? '' : undefined}
                      onClick={() => onLaunch(id)}
                      className={`flex h-9 w-full items-center gap-3 px-3 text-sm hover:bg-(--w10-shell-hover) active:bg-(--w10-shell-pressed) ${FOCUS}`}
                    >
                      <AppSquare app={apps[id].icon} size="list" />
                      {apps[id].title}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <section aria-labelledby="w10-tiles-title" className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-4">
        <h2 id="w10-tiles-title" className="mb-2 px-0.5 text-sm">
          Portfolio
        </h2>
        <ul aria-label="Tiles" className="grid w-max grid-cols-[repeat(3,96px)] gap-1">
          {TILES.map((id) => {
            const Glyph = GLYPHS[apps[id].icon];
            return (
              <li key={id} className={id === 'about' ? 'col-span-2' : undefined}>
                <button
                  type="button"
                  onClick={() => onLaunch(id)}
                  style={{ background: appColor(apps[id].icon) }}
                  className={`w10-tile relative flex h-24 w-full flex-col items-center justify-center text-white hover:outline-2 hover:-outline-offset-2 hover:outline-(--w10-tile-hover-ring) ${FOCUS}`}
                >
                  <Glyph aria-hidden size={id === 'about' ? 36 : 30} strokeWidth={1.5} />
                  <span className="absolute bottom-1.5 left-2 text-xs">{apps[id].title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
