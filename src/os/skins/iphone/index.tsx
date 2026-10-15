'use client';

import { MobileShell, type MobileSkin } from '@/os/core/mobile/mobile-shell';
import { SwitchOsApp } from '@/os/core/mobile/switch-os-app';
import type { OsRootProps } from '@/os/core/types';
import { IosAppHeader } from './app-header';
import { IosHomeIndicator } from './home-indicator';
import { AppIcon } from './icons';
import { IosStatusBar } from './status-bar';
import './theme.css';

/** The `Switch OS` pseudo-app, as Settings-like grouped list. */
function SwitchOs() {
  return <SwitchOsApp current="iphone" classNames={{ root: 'ios-settings', note: 'ios-group-note', group: 'ios-group', action: 'ios-row ios-row-action' }} />;
}

// Static: nothing here depends on props, so the skin object keeps one identity.
const skin: MobileSkin = {
  wallpaper: <div className="ios-wallpaper absolute inset-0" />,
  renderIcon: (app) => <AppIcon app={app} />,
  StatusBar: IosStatusBar,
  homeApps: ['experience', 'skills', 'resume', 'browser'],
  dockApps: ['about', 'projects', 'contact', 'terminal'],
  HomeIndicator: IosHomeIndicator,
  AppHeader: IosAppHeader,
  extraApps: [{ id: 'switch-os', title: 'Switch OS', icon: <AppIcon app="switch-os" />, Component: SwitchOs }],
};

export default function IPhone({ data }: OsRootProps) {
  return (
    <div data-os-skin="iphone">
      <MobileShell data={data} skin={skin} />
    </div>
  );
}
