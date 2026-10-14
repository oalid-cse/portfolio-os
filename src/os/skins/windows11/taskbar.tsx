'use client';

import { BatteryFull, Volume2, Wifi } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import type { AppId } from '@/os/core/types';
import { TrayClock } from './clock';
import { AppTile, StartGlyph } from './icons';
import { StartMenu } from './start-menu';

export const PINNED: AppId[] = ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser'];

const TASK_BUTTON =
  'relative flex size-10 items-center justify-center rounded-[5px] outline-none transition-colors duration-100 hover:bg-(--w11-hover) active:bg-(--w11-pressed) focus-visible:ring-2 focus-visible:ring-(--os-fg)';

export function Taskbar({ api, data }: { api: DesktopApi; data: PortfolioData }) {
  const [startOpen, setStartOpen] = useState(false);
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
          pinned={PINNED}
          onLaunch={launch}
          onClose={(restoreFocus) => {
            setStartOpen(false);
            if (restoreFocus) startButton.current?.focus();
          }}
          ignoreRef={startButton}
        />
      )}
      <nav
        aria-label="Taskbar"
        className="w11-acrylic flex h-full items-center border-t border-(--w11-stroke) bg-(--w11-taskbar) px-3 text-(--os-fg)"
      >
        <div className="flex-1" />
        <ul className="flex items-center gap-1">
          <li>
            <button
              ref={startButton}
              type="button"
              aria-label="Start"
              title="Start"
              aria-expanded={startOpen}
              aria-haspopup="dialog"
              onClick={() => setStartOpen((o) => !o)}
              className={`${TASK_BUTTON} ${startOpen ? 'bg-(--w11-hover)' : ''}`}
            >
              <StartGlyph className="size-[26px]" />
            </button>
          </li>
          {PINNED.map((id) => {
            const win = api.windows.find((w) => w.appId === id);
            const active = !!win && api.focusedId === win.id && win.mode !== 'minimized';
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-label={apps[id].title}
                  title={apps[id].title}
                  aria-pressed={active}
                  onClick={() => onTask(id)}
                  className={`${TASK_BUTTON} ${active ? 'bg-(--w11-hover)' : ''}`}
                >
                  <AppTile app={apps[id].icon} />
                  {win && (
                    <span
                      aria-hidden
                      className={`absolute bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-150 ${
                        active ? 'w-4 bg-(--os-accent)' : 'w-1.5 bg-(--w11-indicator)'
                      }`}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span aria-hidden className="flex h-10 items-center gap-2.5 rounded-[5px] px-2.5">
            <Wifi size={15} strokeWidth={1.75} />
            <Volume2 size={15} strokeWidth={1.75} />
            <BatteryFull size={16} strokeWidth={1.75} />
          </span>
          <span className="flex h-10 items-center rounded-[5px] px-2.5">
            <TrayClock />
          </span>
        </div>
      </nav>
    </div>
  );
}
