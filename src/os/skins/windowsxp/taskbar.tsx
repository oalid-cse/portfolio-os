'use client';

import { ShieldCheck, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';
import type { PortfolioData } from '@/content/types';
import { apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import { TrayClock } from '@/os/core/tray-clock';
import type { AppId } from '@/os/core/types';
import { AppTile, HillGlyph } from './icons';
import { StartMenu } from './start-menu';

const QUICK_LAUNCH: AppId[] = ['about', 'projects', 'contact', 'terminal'];

const FOCUS = 'outline-none focus-visible:outline-1 focus-visible:-outline-offset-2 focus-visible:outline-dotted focus-visible:outline-white';

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
      <nav aria-label="Taskbar" className="xp-shell xp-taskbar flex h-full items-stretch">
        <div ref={startControls} className="flex shrink-0">
          <button
            ref={startButton}
            type="button"
            aria-label="Start"
            title="Click here to begin"
            aria-expanded={startOpen}
            aria-haspopup="dialog"
            data-open={startOpen || undefined}
            onClick={() => setStartOpen((o) => !o)}
            className="xp-start flex h-full items-center gap-1.5 pr-5 pl-2.5 outline-none"
          >
            <HillGlyph className="xp-start-glyph size-[21px]" />
            <span aria-hidden className="xp-start-label text-[19px] leading-none font-bold italic">
              start
            </span>
          </button>
        </div>

        <div role="group" aria-label="Quick Launch" className="xp-quick flex shrink-0 items-center gap-0.5 pr-2 pl-2.5">
          {QUICK_LAUNCH.map((id) => (
            <button
              key={id}
              type="button"
              aria-label={apps[id].title}
              title={apps[id].title}
              onClick={() => api.openApp(id)}
              className={`xp-quick-button flex size-[24px] items-center justify-center rounded-[3px] ${FOCUS}`}
            >
              <AppTile app={apps[id].icon} size="sm" />
            </button>
          ))}
        </div>

        <ul aria-label="Open windows" className="flex min-w-0 flex-1 items-center gap-[3px] px-1">
          {api.windows.map((win) => {
            const minimized = win.mode === 'minimized';
            const active = api.focusedId === win.id && !minimized;
            return (
              <li key={win.id} className="flex min-w-0 basis-[160px]">
                <button
                  type="button"
                  aria-pressed={active}
                  data-active={active || undefined}
                  onClick={() => api.toggleApp(win.appId)}
                  className={`xp-task flex h-[24px] w-full min-w-0 items-center gap-1.5 rounded-[3px] px-2 text-left text-[11px] ${FOCUS}`}
                >
                  <AppTile app={apps[win.appId].icon} size="xs" />
                  <span className="truncate">{win.title}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="xp-tray flex shrink-0 items-center gap-2 pr-3 pl-3">
          <span aria-hidden className="flex items-center gap-1.5">
            <ShieldCheck size={14} strokeWidth={2.25} />
            <Volume2 size={14} strokeWidth={2.25} />
          </span>
          <TrayClock variant="inline" className="text-[11px] whitespace-nowrap tabular-nums" placeholderClassName="w-12" />
        </div>
      </nav>
    </div>
  );
}
