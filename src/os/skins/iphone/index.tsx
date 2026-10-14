'use client';

import { MobileShell, type MobileSkin } from '@/os/core/mobile/mobile-shell';
import type { OsRootProps } from '@/os/core/types';
import { IosAppHeader } from './app-header';
import { IosHomeIndicator } from './home-indicator';
import { AppIcon } from './icons';
import { IosStatusBar } from './status-bar';
import { SwitchOsApp } from './switch-os-app';
import './theme.css';

// Static: nothing here depends on props, so the skin object keeps one identity.
const skin: MobileSkin = {
  wallpaper: <div className="ios-wallpaper absolute inset-0" />,
  renderIcon: (app) => <AppIcon app={app} />,
  StatusBar: IosStatusBar,
  homeApps: ['experience', 'skills', 'resume', 'browser'],
  dockApps: ['about', 'projects', 'contact', 'terminal'],
  HomeIndicator: IosHomeIndicator,
  AppHeader: IosAppHeader,
  extraApps: [{ id: 'switch-os', title: 'Switch OS', icon: <AppIcon app="switch-os" />, Component: SwitchOsApp }],
};

export default function IPhone({ data }: OsRootProps) {
  return (
    <div data-os-skin="iphone">
      <MobileShell data={data} skin={skin} />
    </div>
  );
}
