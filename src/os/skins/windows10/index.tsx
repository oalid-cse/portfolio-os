'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { DesktopShell, type DesktopSkin } from '@/os/core/desktop/desktop-shell';
import type { OsRootProps } from '@/os/core/types';
import { Win10BootScreen } from './boot-screen';
import { AppSquare } from './icons';
import { Taskbar } from './taskbar';
import { Win10WindowChrome } from './window-chrome';
import './theme.css';

const TASKBAR_HEIGHT = 40;

export default function Windows10({ data }: OsRootProps) {
  const skin = useMemo<DesktopSkin>(
    () => ({
      wallpaper: <div className="w10-wallpaper absolute inset-0" />,
      WindowChrome: Win10WindowChrome,
      renderIcon: (app) => <AppSquare app={app} size="lg" />,
      bottomBar: (api) => <Taskbar api={api} data={data} />,
      desktopIcons: ['about', 'projects', 'experience', 'resume', 'terminal'],
      insets: { top: 0, bottom: TASKBAR_HEIGHT },
      mobileAlternative: 'iphone',
    }),
    [data],
  );
  const BootScreen = useMemo(() => {
    const Screen = () => <Win10BootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="windows10" className="h-dvh">
      <BootGate id="windows10" Screen={BootScreen}>
        <DesktopShell data={data} skin={skin} />
      </BootGate>
    </div>
  );
}
