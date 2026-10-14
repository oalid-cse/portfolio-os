'use client';

import { AnimatePresence } from 'framer-motion';
import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useStore } from 'zustand';
import type { PortfolioData } from '@/content/types';
import { apps } from '../apps';
import type { AppIconName, AppId, OsId } from '../types';
import { DesktopIcon } from './desktop-icon';
import { SmallScreenNotice } from './small-screen-notice';
import { useReducedMotion } from './use-reduced-motion';
import { Window, type WindowChromeProps } from './window';
import { createWindowStore, type WinState } from './window-store';

export type DesktopApi = {
  windows: WinState[];
  focusedId: string | null;
  openApp(id: AppId): void;
  focus(id: string): void;
  minimize(id: string): void;
};

export type DesktopSkin = {
  wallpaper: ReactNode;
  WindowChrome: ComponentType<WindowChromeProps>;
  renderIcon(app: AppIconName): ReactNode;
  topBar?: ReactNode;
  bottomBar: (api: DesktopApi) => ReactNode;
  desktopIcons: AppId[];
  insets: { top: number; bottom: number };
  mobileAlternative: OsId;
};

export type DesktopShellProps = {
  data: PortfolioData;
  skin: DesktopSkin;
  closeShortcut?: (e: KeyboardEvent) => boolean;
};

export const DESKTOP_MIN_WIDTH = 768;

const altF4 = (e: KeyboardEvent) => e.altKey && e.key === 'F4';

const subscribeResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
};
const getWidth = () => window.innerWidth;
/** Unknown on the server: render nothing until the client knows the viewport. */
const getServerWidth = () => null;

const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });

export function DesktopShell({ data, skin, closeShortcut = altF4 }: DesktopShellProps) {
  const width = useSyncExternalStore(subscribeResize, getWidth, getServerWidth);
  if (width === null) return null;
  if (width < DESKTOP_MIN_WIDTH) return <SmallScreenNotice mobileAlternative={skin.mobileAlternative} />;
  return <Desktop data={data} skin={skin} closeShortcut={closeShortcut} />;
}

function Desktop({ data, skin, closeShortcut }: Required<DesktopShellProps>) {
  const { top, bottom } = skin.insets;
  // One store per desktop instance (never a module singleton).
  const [store] = useState(() => createWindowStore({ viewport, topInset: top, bottomInset: bottom }));
  const windows = useStore(store, (s) => s.windows);
  const focusedId = useStore(store, (s) => s.focusedId);
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<AppId | null>(null);

  const openApp = useCallback((id: AppId) => store.getState().open(id, apps[id].title), [store]);

  useEffect(() => {
    const onResize = () => store.getState().clampAll();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [store]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const { focusedId: id, close } = store.getState();
      if (!id || !closeShortcut(e)) return;
      e.preventDefault();
      close(id);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [store, closeShortcut]);

  const api = useMemo<DesktopApi>(() => {
    const { focus, minimize } = store.getState();
    return { windows, focusedId, openApp, focus, minimize };
  }, [store, windows, focusedId, openApp]);

  const actions = store.getState();

  return (
    <div className="fixed inset-0 overflow-hidden select-none">
      <div className="absolute inset-0 z-0">{skin.wallpaper}</div>

      <div
        className="absolute inset-x-0 z-0 grid auto-cols-max grid-flow-col content-start gap-1 p-2"
        style={{ top, bottom, gridTemplateRows: 'repeat(auto-fill, minmax(88px, max-content))' }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        {skin.desktopIcons.map((id) => (
          <DesktopIcon
            key={id}
            title={apps[id].title}
            icon={skin.renderIcon(apps[id].icon)}
            selected={selected === id}
            onSelect={() => setSelected(id)}
            onOpen={() => openApp(id)}
          />
        ))}
      </div>

      {/* Isolated stacking context so ever-growing window z values stay below the bars. */}
      <div className="pointer-events-none absolute inset-0 isolate z-10">
        <AnimatePresence>
          {windows.map((win) => {
            const { Component } = apps[win.appId];
            return (
              <Window
                key={win.id}
                win={win}
                focused={focusedId === win.id}
                Chrome={skin.WindowChrome}
                reducedMotion={reducedMotion}
                onFocus={() => actions.focus(win.id)}
                onClose={() => actions.close(win.id)}
                onMinimize={() => actions.minimize(win.id)}
                onToggleMaximize={() => actions.toggleMaximize(win.id)}
                onMove={(x, y) => actions.move(win.id, x, y)}
                onResize={(w, h) => actions.resize(win.id, w, h)}
              >
                <Component data={data} openApp={openApp} />
              </Window>
            );
          })}
        </AnimatePresence>
      </div>

      {skin.topBar !== undefined && (
        <div className="absolute inset-x-0 top-0 z-20" style={{ height: top }}>
          {skin.topBar}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20" style={{ height: bottom }}>
        {skin.bottomBar(api)}
      </div>
    </div>
  );
}
