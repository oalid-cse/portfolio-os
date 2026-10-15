'use client';

import { AnimatePresence } from 'framer-motion';
import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useStore } from 'zustand';
import type { PortfolioData } from '@/content/types';
import { apps } from '../apps';
import type { AppIconName, AppId, OsId } from '../types';
import { DesktopIcon } from './desktop-icon';
import { SmallScreenNotice } from './small-screen-notice';
import { useReducedMotion } from './use-reduced-motion';
import { Window, type WindowChromeProps } from './window';
import { createWindowStore, type WindowStore, type WinState } from './window-store';

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
  topBar?: (api: DesktopApi) => ReactNode;
  bottomBar: (api: DesktopApi) => ReactNode;
  /** Vertical bar on the left edge (e.g. a dock), rendered in a column `insets.left` wide. */
  leftBar?: (api: DesktopApi) => ReactNode;
  desktopIcons: AppId[];
  /** Reserved edges; `left` defaults to 0. */
  insets: { top: number; bottom: number; left?: number };
  mobileAlternative: OsId;
  /** Optional classes for each window's content area (it carries `data-maximized` when maximized). */
  windowBodyClassName?: string;
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
  // One store per shell instance (never a module singleton). It lives here, above the breakpoint
  // switch, so open windows survive a trip below 768px and back. Insets are read once.
  const [store] = useState(() =>
    createWindowStore({
      viewport,
      topInset: skin.insets.top,
      bottomInset: skin.insets.bottom,
      leftInset: skin.insets.left ?? 0,
    }),
  );
  if (width === null) return null;
  if (width < DESKTOP_MIN_WIDTH) return <SmallScreenNotice mobileAlternative={skin.mobileAlternative} />;
  return <Desktop data={data} skin={skin} closeShortcut={closeShortcut} store={store} />;
}

type DesktopProps = Required<DesktopShellProps> & { store: WindowStore };

function Desktop({ data, skin, closeShortcut, store }: DesktopProps) {
  const { top, bottom, left = 0 } = skin.insets;
  const windows = useStore(store, (s) => s.windows);
  const focusedId = useStore(store, (s) => s.focusedId);
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<AppId | null>(null);

  const openApp = useCallback((id: AppId) => store.getState().open(id, apps[id].title), [store]);

  // Where keyboard focus goes back to when the last window closes or minimizes: the last thing
  // focused outside any window or menu (dialogs), e.g. the desktop icon or Start button.
  const opener = useRef<HTMLElement | null>(null);
  const iconGrid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && !e.target.closest('[role="dialog"]')) opener.current = e.target;
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // No window is focused any more: if focus was in a window (or already dropped to <body>), send
  // it back to the opener, or the first desktop icon when the opener is gone (e.g. a closed menu).
  const hadFocusedWindow = useRef(false);
  useEffect(() => {
    const had = hadFocusedWindow.current;
    hadFocusedWindow.current = focusedId !== null;
    if (focusedId !== null || !had) return;
    const active = document.activeElement;
    if (active && active !== document.body && !active.closest('[role="dialog"]')) return;
    const target = opener.current?.isConnected ? opener.current : iconGrid.current?.querySelector('button');
    target?.focus({ preventScroll: true });
  }, [focusedId]);

  useEffect(() => {
    const onResize = () => store.getState().clampAll();
    onResize(); // the viewport may have changed while the desktop was unmounted
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
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 z-0 select-none">{skin.wallpaper}</div>

      <div
        ref={iconGrid}
        className="absolute right-0 z-0 grid select-none auto-cols-max grid-flow-col content-start gap-1 p-2"
        style={{ top, bottom, left, gridTemplateRows: 'repeat(auto-fill, minmax(88px, max-content))' }}
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
                bodyClassName={skin.windowBodyClassName}
                reducedMotion={reducedMotion}
                onFocus={() => actions.focus(win.id)}
                onClose={() => actions.close(win.id)}
                onMinimize={() => actions.minimize(win.id)}
                onToggleMaximize={() => actions.toggleMaximize(win.id)}
                onMove={(x, y) => actions.move(win.id, x, y)}
                onSetBounds={(b) => actions.setBounds(win.id, b)}
              >
                <Component data={data} openApp={openApp} />
              </Window>
            );
          })}
        </AnimatePresence>
      </div>

      {skin.topBar !== undefined && (
        <div className="absolute inset-x-0 top-0 z-20 select-none" style={{ height: top }}>
          {skin.topBar(api)}
        </div>
      )}
      {skin.leftBar !== undefined && (
        <div className="absolute left-0 z-20 select-none" style={{ top, bottom, width: left }}>
          {skin.leftBar(api)}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 z-20 select-none" style={{ height: bottom }}>
        {skin.bottomBar(api)}
      </div>
    </div>
  );
}
