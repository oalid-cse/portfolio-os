'use client';

import { AnimatePresence } from 'framer-motion';
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useStore } from 'zustand';
import type { PortfolioData } from '@/content/types';
import { apps } from '../apps';
import { useReducedMotion } from '../desktop/use-reduced-motion';
import type { AppIconName, AppId } from '../types';
import { AppScreen } from './app-screen';
import { createAppStackStore } from './app-stack-store';
import { DeviceFrame } from './device-frame';
import { HomeScreen, type LauncherEntry } from './home-screen';

/** A skin-defined pseudo-app (e.g. iPhone's "Switch OS"), appended to the home grid. */
export type ExtraApp = { id: string; title: string; icon: ReactNode; Component: ComponentType };

export type NavBarProps = {
  onHome(): void;
  /** Leaves the current app (to the home screen); a no-op on the home screen. */
  onBack(): void;
};

/**
 * Everything a mobile skin provides. Layout tokens are CSS variables the skin sets on its root:
 * `--mobile-status-height`, `--mobile-nav-height`, `--mobile-icon-size`, `--mobile-grid-columns`.
 */
export type MobileSkin = {
  wallpaper: ReactNode;
  renderIcon(app: AppIconName): ReactNode;
  StatusBar: ComponentType;
  homeApps: AppId[];
  dockApps: AppId[];
  /** Bottom navigation: iPhone's home bar, or a button nav bar (Back/Home). */
  HomeIndicator: ComponentType<NavBarProps>;
  AppHeader: ComponentType<{ title: string; onBack(): void }>;
  extraApps?: ExtraApp[];
};

export type MobileShellProps = { data: PortfolioData; skin: MobileSkin };

const isAppId = (id: string): id is AppId => Object.hasOwn(apps, id);

const noSubscribe = () => () => {};
/** Client-only, like the desktop shell: the phone renders once, after hydration, never twice. */
const useIsClient = () => useSyncExternalStore(noSubscribe, () => true, () => false);

export function MobileShell({ data, skin }: MobileShellProps) {
  // One store per shell instance (never a module singleton).
  const [store] = useState(createAppStackStore);
  const current = useStore(store, (s) => s.current);
  const reducedMotion = useReducedMotion();
  const [origin, setOrigin] = useState<string | null>(null);
  const icons = useRef(new Map<string, HTMLButtonElement>());

  const { extraApps, renderIcon } = skin;
  const entry = useCallback(
    (id: AppId): LauncherEntry => ({ id, title: apps[id].title, icon: renderIcon(apps[id].icon) }),
    [renderIcon],
  );
  const grid = useMemo(
    () => [...skin.homeApps.map(entry), ...(extraApps ?? []).map(({ id, title, icon }) => ({ id, title, icon }))],
    [skin.homeApps, extraApps, entry],
  );
  const dock = useMemo(() => skin.dockApps.map(entry), [skin.dockApps, entry]);

  const launch = useCallback(
    (id: string, from: string) => {
      setOrigin(from);
      store.getState().openApp(id);
    },
    [store],
  );
  // Apps opening apps (Terminal's `open projects`) have no icon to zoom from.
  const openApp = useCallback(
    (id: AppId) => {
      setOrigin(null);
      store.getState().openApp(id);
    },
    [store],
  );
  const goHome = useCallback(() => store.getState().goHome(), [store]);

  // Back on the home screen: return focus to the icon the app was opened from.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (current === null && wasOpen.current && origin) icons.current.get(origin)?.focus({ preventScroll: true });
    wasOpen.current = current !== null;
  }, [current, origin]);

  const registerIcon = useCallback((key: string, el: HTMLButtonElement | null) => {
    if (el) icons.current.set(key, el);
    else icons.current.delete(key);
  }, []);

  let screen: ReactNode = null;
  if (current !== null) {
    const extra = extraApps?.find((a) => a.id === current);
    const title = isAppId(current) ? apps[current].title : extra?.title;
    let body: ReactNode = null;
    if (isAppId(current)) {
      const { Component } = apps[current];
      body = <Component data={data} openApp={openApp} />;
    } else if (extra) {
      body = <extra.Component />;
    }
    if (title !== undefined)
      screen = (
        <AppScreen
          key={current}
          id={current}
          title={title}
          Header={skin.AppHeader}
          onBack={goHome}
          origin={origin}
          reducedMotion={reducedMotion}
        >
          {body}
        </AppScreen>
      );
  }

  const isClient = useIsClient();
  if (!isClient) return null;

  const { StatusBar, HomeIndicator } = skin;
  return (
    <DeviceFrame onSwipeHome={goHome}>
      <div data-mobile="wallpaper" className="absolute inset-0 select-none">
        {skin.wallpaper}
      </div>
      <HomeScreen
        grid={grid}
        dock={dock}
        onLaunch={launch}
        registerIcon={registerIcon}
        covered={current !== null}
        reducedMotion={reducedMotion}
      />
      {reducedMotion ? screen : <AnimatePresence>{screen}</AnimatePresence>}
      <div data-mobile="status-bar" className="pointer-events-none absolute inset-x-0 top-0 z-30 select-none">
        <StatusBar />
      </div>
      <div data-mobile="nav-bar" className="absolute inset-x-0 bottom-0 z-30 touch-none select-none">
        <HomeIndicator onHome={goHome} onBack={goHome} />
      </div>
    </DeviceFrame>
  );
}
