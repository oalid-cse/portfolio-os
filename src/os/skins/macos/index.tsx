'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { DesktopShell, type DesktopSkin } from '@/os/core/desktop/desktop-shell';
import type { OsRootProps } from '@/os/core/types';
import { MacBootScreen } from './boot-screen';
import { Dock } from './dock';
import { AppIcon } from './icons';
import { MenuBar } from './menu-bar';
import { MacWindowChrome } from './window-chrome';
import './theme.css';

const MENU_BAR_HEIGHT = 28;
const DOCK_HEIGHT = 80;

const cmdW = (e: KeyboardEvent) => e.metaKey && e.key.toLowerCase() === 'w';

export default function MacOS({ data }: OsRootProps) {
  const skin = useMemo<DesktopSkin>(
    () => ({
      wallpaper: <div className="mac-wallpaper absolute inset-0" />,
      WindowChrome: MacWindowChrome,
      renderIcon: (app) => <AppIcon app={app} className="size-12" />,
      topBar: (api) => <MenuBar api={api} />,
      bottomBar: (api) => <Dock api={api} />,
      desktopIcons: ['about', 'projects', 'resume', 'terminal'],
      insets: { top: MENU_BAR_HEIGHT, bottom: DOCK_HEIGHT },
      mobileAlternative: 'iphone',
    }),
    [],
  );
  const BootScreen = useMemo(() => {
    const Screen = () => <MacBootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="macos" className="h-dvh">
      <BootGate id="macos" Screen={BootScreen}>
        <DesktopShell data={data} skin={skin} closeShortcut={cmdW} />
      </BootGate>
    </div>
  );
}
