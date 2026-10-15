'use client';

import { apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import type { AppId } from '@/os/core/types';
import { AppIcon, ShowAppsGlyph } from './icons';
import { OVERVIEW_ID, OVERVIEW_TOGGLE, useOverview } from './overview-state';

export const DOCK_APPS: AppId[] = ['about', 'projects', 'experience', 'skills', 'resume', 'contact', 'terminal', 'browser'];

const TILE =
  'group relative flex size-12 items-center justify-center rounded-xl outline-none transition-colors duration-100 hover:bg-(--ubu-dock-hover) focus-visible:bg-(--ubu-dock-hover) focus-visible:ring-2 focus-visible:ring-(--ubu-orange)';

function Tooltip({ label }: { label: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-[calc(100%+14px)] -translate-y-1/2 rounded-lg bg-(--ubu-tooltip) px-2.5 py-1 text-[13px] whitespace-nowrap text-(--os-fg) opacity-0 shadow-[0_2px_8px_rgb(0_0_0/0.45)] transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

/** The Ubuntu Dock: a full-height panel on the left, orange dots beside running apps, "Show apps" last. */
export function Dock({ api }: { api: DesktopApi }) {
  const overview = useOverview();

  // GNOME behaviour: a dock click opens, restores or raises an app; it never minimizes.
  const activate = (id: AppId) => {
    overview.setOpen(false);
    const win = api.windows.find((w) => w.appId === id);
    if (win) api.focus(win.id);
    else api.openApp(id);
  };

  return (
    <nav aria-label="Dock" className="ubu-blur flex h-full flex-col items-center bg-(--ubu-dock) py-2">
      {/* Scrolls when the window is too short for every app. Only then: scrolling clips the
          tooltips, which overhang the dock to the right. */}
      <ul className="flex min-h-0 flex-col items-center gap-1.5 [scrollbar-width:none] [@media(max-height:600px)]:overflow-y-auto [@media(max-height:600px)]:px-2">
        {DOCK_APPS.map((id) => {
          const running = api.windows.some((w) => w.appId === id);
          const focused = api.windows.some((w) => w.appId === id && w.id === api.focusedId);
          const { title, icon } = apps[id];
          return (
            <li key={id} className="relative flex items-center">
              <span
                aria-hidden
                data-running={running || undefined}
                className={`absolute -left-2 size-[5px] rounded-full bg-(--ubu-orange) transition-opacity ${running ? 'opacity-100' : 'opacity-0'}`}
              />
              <button
                type="button"
                aria-label={title}
                onClick={() => activate(id)}
                className={`${TILE} ${focused ? 'bg-(--ubu-dock-active)' : ''}`}
              >
                <AppIcon app={icon} className="size-10" />
                <Tooltip label={title} />
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        {...{ [OVERVIEW_TOGGLE]: '' }}
        aria-label="Show apps"
        aria-expanded={overview.open}
        aria-controls={overview.open ? OVERVIEW_ID : undefined}
        onClick={() => overview.setOpen((o) => !o)}
        className={`${TILE} mt-auto text-(--os-fg) ${overview.open ? 'bg-(--ubu-dock-active)' : ''}`}
      >
        <ShowAppsGlyph className="size-6" />
        <Tooltip label="Show apps" />
      </button>
    </nav>
  );
}
