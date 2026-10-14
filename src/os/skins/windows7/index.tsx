'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { DesktopShell, type DesktopSkin } from '@/os/core/desktop/desktop-shell';
import type { OsRootProps } from '@/os/core/types';
import { Win7BootScreen } from './boot-screen';
import { AppGem } from './icons';
import { Taskbar } from './taskbar';
import { Win7WindowChrome } from './window-chrome';
import './theme.css';

const TASKBAR_HEIGHT = 40;

export default function Windows7({ data }: OsRootProps) {
  const skin = useMemo<DesktopSkin>(
    () => ({
      wallpaper: <div className="w7-wallpaper absolute inset-0" />,
      WindowChrome: Win7WindowChrome,
      renderIcon: (app) => <AppGem app={app} size="lg" />,
      bottomBar: (api) => <Taskbar api={api} data={data} />,
      desktopIcons: ['about', 'projects', 'experience', 'resume', 'terminal'],
      insets: { top: 0, bottom: TASKBAR_HEIGHT },
      mobileAlternative: 'iphone',
    }),
    [data],
  );
  const BootScreen = useMemo(() => {
    const Screen = () => <Win7BootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="windows7" className="h-dvh">
      <BootGate id="windows7" Screen={BootScreen}>
        <DesktopShell data={data} skin={skin} />
      </BootGate>
    </div>
  );
}
