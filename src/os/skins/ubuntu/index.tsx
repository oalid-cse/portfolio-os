'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { DesktopShell, type DesktopSkin } from '@/os/core/desktop/desktop-shell';
import type { OsRootProps } from '@/os/core/types';
import { UbuntuBootScreen } from './boot-screen';
import { Dock } from './dock';
import { ubuntuFont } from './font';
import { AppIcon } from './icons';
import { Overview } from './overview';
import { OverviewProvider } from './overview-state';
import { TopBar } from './top-bar';
import { UbuntuWindowChrome } from './window-chrome';
import './theme.css';

const TOP_BAR_HEIGHT = 32;
const DOCK_WIDTH = 64;

export default function Ubuntu({ data }: OsRootProps) {
  const skin = useMemo<DesktopSkin>(
    () => ({
      wallpaper: <div className="ubu-wallpaper absolute inset-0" />,
      WindowChrome: UbuntuWindowChrome,
      renderIcon: (app) => <AppIcon app={app} className="size-12" />,
      topBar: () => <TopBar />,
      leftBar: (api) => (
        <>
          <Dock api={api} />
          <Overview api={api} />
        </>
      ),
      bottomBar: () => null,
      desktopIcons: ['about', 'projects', 'resume', 'terminal'],
      insets: { top: TOP_BAR_HEIGHT, bottom: 0, left: DOCK_WIDTH },
      mobileAlternative: 'iphone',
      windowBodyClassName: 'ubu-window-body',
    }),
    [],
  );
  const BootScreen = useMemo(() => {
    const Screen = () => <UbuntuBootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="ubuntu" className={`${ubuntuFont.variable} h-dvh`}>
      <BootGate id="ubuntu" Screen={BootScreen}>
        <OverviewProvider>
          <DesktopShell data={data} skin={skin} />
        </OverviewProvider>
      </BootGate>
    </div>
  );
}
