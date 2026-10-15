'use client';

import { ChevronUp, MessageSquare, Search, Volume2, Wifi } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { ALL_APP_IDS, apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import { TrayClock } from '@/os/core/tray-clock';
import type { AppId } from '@/os/core/types';
import { AppSquare, StartGlyph } from './icons';
import { StartMenu } from './start-menu';

const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white';
const BAR_BUTTON = `relative flex h-full w-12 shrink-0 items-center justify-center hover:bg-(--w10-shell-hover) active:bg-(--w10-shell-pressed) ${FOCUS}`;

export function Taskbar({ api, data }: { api: DesktopApi; data: PortfolioData }) {
  const [startOpen, setStartOpen] = useState(false);
  const startControls = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);

  const launch = (id: AppId) => {
    setStartOpen(false);
    api.openApp(id);
  };

  return (
    <div className="relative h-full">
      {startOpen && (
        <StartMenu
          data={data}
          onLaunch={launch}
          onClose={(restoreFocus) => {
            setStartOpen(false);
            if (restoreFocus) startButton.current?.focus();
          }}
          ignoreRef={startControls}
        />
      )}
      <nav aria-label="Taskbar" className="w10-shell w10-acrylic flex h-full items-stretch bg-(--w10-taskbar)">
        <div ref={startControls} className="flex shrink-0 items-stretch">
          <button
            ref={startButton}
            type="button"
            aria-label="Start"
            title="Start"
            aria-expanded={startOpen}
            aria-haspopup="dialog"
            onClick={() => setStartOpen((o) => !o)}
            className={`${BAR_BUTTON} hover:text-(--w10-accent-light) ${startOpen ? 'bg-(--w10-shell-hover)' : ''}`}
          >
            <StartGlyph className="size-[18px]" />
          </button>
          {/* Search is not implemented: the box is a button that opens Start, where every app is listed. */}
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setStartOpen(true)}
            className={`flex h-full w-12 shrink-0 items-center justify-center gap-2.5 lg:w-[344px] lg:justify-start lg:bg-(--w10-search) lg:px-3 lg:text-(--w10-search-fg) max-lg:hover:bg-(--w10-shell-hover) lg:hover:bg-white ${FOCUS} lg:focus-visible:outline-(--w10-accent)`}
          >
            <Search aria-hidden size={16} strokeWidth={1.75} className="shrink-0" />
            <span className="text-sm max-lg:sr-only">Type here to search</span>
          </button>
        </div>

        <ul className="flex min-w-0 items-stretch">
          {ALL_APP_IDS.map((id) => {
            const win = api.windows.find((w) => w.appId === id);
            const active = !!win && api.focusedId === win.id && win.mode !== 'minimized';
            return (
              <li key={id} className="flex">
                <button
                  type="button"
                  aria-label={apps[id].title}
                  title={apps[id].title}
                  aria-pressed={active}
                  onClick={() => api.toggleApp(id)}
                  className={`${BAR_BUTTON} ${active ? 'bg-(--w10-shell-pressed)' : ''}`}
                >
                  <AppSquare app={apps[id].icon} />
                  {win && (
                    <span
                      aria-hidden
                      className={`absolute bottom-0 h-0.5 bg-(--w10-indicator) ${active ? 'inset-x-0' : 'inset-x-1.5'}`}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-stretch">
          <span aria-hidden className="flex items-center gap-3 px-2.5">
            <ChevronUp size={15} strokeWidth={1.5} />
            <Wifi size={15} strokeWidth={1.5} />
            <Volume2 size={15} strokeWidth={1.5} />
          </span>
          <span className="flex items-center px-2">
            <TrayClock className="flex flex-col items-center justify-center text-xs leading-[1.3] tabular-nums" />
          </span>
          <span aria-hidden className="flex w-12 items-center justify-center">
            <MessageSquare size={16} strokeWidth={1.5} />
          </span>
          <span aria-hidden className="w-1.5 border-l border-(--w10-shell-stroke)" />
        </div>
      </nav>
    </div>
  );
}
