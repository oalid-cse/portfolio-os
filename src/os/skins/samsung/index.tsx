'use client';

import { useMemo } from 'react';
import { BootGate } from '@/os/core/boot';
import { MobileShell, type MobileSkin } from '@/os/core/mobile/mobile-shell';
import { SwitchOsApp } from '@/os/core/mobile/switch-os-app';
import type { OsRootProps } from '@/os/core/types';
import { OneUiAppHeader } from './app-header';
import { OneUiBootScreen } from './boot-screen';
import { HomeWallpaper } from './home-wallpaper';
import { AppIcon } from './icons';
import { OneUiNavBar } from './nav-bar';
import { OneUiStatusBar } from './status-bar';
import './theme.css';

/** The `Switch OS` pseudo-app, as One UI settings cards. */
function SwitchOs() {
  return <SwitchOsApp current="samsung" classNames={{ root: 'oneui-settings', note: 'oneui-note', group: 'oneui-group', action: 'oneui-row-action' }} />;
}

// Static: nothing here depends on props, so the skin object keeps one identity.
const skin: MobileSkin = {
  wallpaper: <HomeWallpaper />,
  renderIcon: (app) => <AppIcon app={app} />,
  StatusBar: OneUiStatusBar,
  homeApps: ['experience', 'skills', 'resume', 'browser'],
  dockApps: ['about', 'projects', 'contact', 'terminal'],
  HomeIndicator: OneUiNavBar,
  AppHeader: OneUiAppHeader,
  extraApps: [{ id: 'switch-os', title: 'Switch OS', icon: <AppIcon app="switch-os" />, Component: SwitchOs }],
};

export default function Samsung({ data }: OsRootProps) {
  const BootScreen = useMemo(() => {
    const Screen = () => <OneUiBootScreen name={data.profile.name} />;
    return Screen;
  }, [data.profile.name]);

  return (
    <div data-os-skin="samsung">
      <BootGate id="samsung" Screen={BootScreen}>
        <MobileShell data={data} skin={skin} />
      </BootGate>
    </div>
  );
}
