'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { DesktopShell, type DesktopSkin } from '@/os/core/desktop/desktop-shell';
import type { OsRootProps } from '@/os/core/types';
import { XpBootScreen } from './boot-screen';
import { AppTile } from './icons';
import { Taskbar } from './taskbar';
import { XpWindowChrome } from './window-chrome';
import './theme.css';

const TASKBAR_HEIGHT = 30;

export default function WindowsXp({ data }: OsRootProps) {
  const skin = useMemo<DesktopSkin>(
    () => ({
      wallpaper: <div className="xp-wallpaper absolute inset-0" />,
      WindowChrome: XpWindowChrome,
      renderIcon: (app) => <AppTile app={app} size="lg" />,
      bottomBar: (api) => <Taskbar api={api} data={data} />,
      desktopIcons: ['about', 'projects', 'experience', 'resume', 'terminal'],
      insets: { top: 0, bottom: TASKBAR_HEIGHT },
      mobileAlternative: 'iphone',
      windowBodyClassName: 'xp-window-body',
    }),
    [data],
  );
  const BootScreen = useMemo(() => {
    const Screen = () => <XpBootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="windowsxp" className="h-dvh">
      <BootGate id="windowsxp" Screen={BootScreen}>
        <DesktopShell data={data} skin={skin} />
      </BootGate>
    </div>
  );
}
