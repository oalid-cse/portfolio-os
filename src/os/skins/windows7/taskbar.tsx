'use client';

import { ChevronUp, Signal, Volume2 } from 'lucide-react';
import { type CSSProperties, useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import type { AppId } from '@/os/core/types';
import { TrayClock } from './clock';
import { AppGem, appColor, StartOrb } from './icons';
import { StartMenu } from './start-menu';

export const PINNED: AppId[] = ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser'];

const FOCUS = 'outline-none focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-white/80';

export function Taskbar({ api, data }: { api: DesktopApi; data: PortfolioData }) {
  const [startOpen, setStartOpen] = useState(false);
  const startControls = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);

  const onTask = (id: AppId) => {
    const win = api.windows.find((w) => w.appId === id);
    if (!win) return api.openApp(id);
    if (api.focusedId === win.id && win.mode !== 'minimized') return api.minimize(win.id);
    api.focus(win.id); // also restores a minimized window
  };

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
      <nav aria-label="Taskbar" className="w7-shell w7-glass w7-taskbar flex h-full items-stretch">
        <div ref={startControls} className="flex shrink-0 items-center">
          <button
            ref={startButton}
            type="button"
            aria-label="Start"
            title="Start"
            aria-expanded={startOpen}
            aria-haspopup="dialog"
            data-open={startOpen || undefined}
            onClick={() => setStartOpen((o) => !o)}
            className="w7-orb-button relative flex h-full w-[58px] items-end justify-center pb-[2px] outline-none"
          >
            <StartOrb className="size-[46px]" />
          </button>
        </div>

        <ul className="flex min-w-0 items-stretch gap-0.5 py-px pl-1">
          {PINNED.map((id) => {
            const win = api.windows.find((w) => w.appId === id);
            const active = !!win && api.focusedId === win.id && win.mode !== 'minimized';
            const state = active ? 'active' : win ? 'running' : 'pinned';
            return (
              <li key={id} className="flex">
                <button
                  type="button"
                  aria-label={apps[id].title}
                  title={apps[id].title}
                  aria-pressed={active}
                  data-state={state}
                  onClick={() => onTask(id)}
                  style={{ '--w7-glow': appColor(apps[id].icon) } as CSSProperties}
                  className={`w7-superbar-button relative flex h-full w-[60px] shrink-0 items-center justify-center rounded-[3px] ${FOCUS}`}
                >
                  <AppGem app={apps[id].icon} size="sm" />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-stretch">
          <span aria-hidden className="flex items-center gap-2.5 px-2.5">
            <ChevronUp size={14} strokeWidth={2} />
            <Signal size={15} strokeWidth={2} />
            <Volume2 size={15} strokeWidth={2} />
          </span>
          <span className="flex items-center px-2.5">
            <TrayClock />
          </span>
          <span aria-hidden className="w7-show-desktop ml-1 w-[15px]" />
        </div>
      </nav>
    </div>
  );
}
