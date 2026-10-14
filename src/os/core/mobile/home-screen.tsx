'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export type LauncherEntry = { id: string; title: string; icon: ReactNode };

export type HomeScreenProps = {
  grid: LauncherEntry[];
  dock: LauncherEntry[];
  /** `origin` is the tapped icon's layout id, so the app can zoom out of it. */
  onLaunch(id: string, origin: string): void;
  /** Lets the shell return focus to the icon an app was opened from. */
  registerIcon(origin: string, el: HTMLButtonElement | null): void;
  /** True while an app covers the home screen: it leaves the tab order and the a11y tree. */
  covered: boolean;
  reducedMotion: boolean;
};

export const originId = (place: 'grid' | 'dock', id: string) => `mobile-${place}-${id}`;

function Launcher({ entry, place, props }: { entry: LauncherEntry; place: 'grid' | 'dock'; props: HomeScreenProps }) {
  const origin = originId(place, entry.id);
  return (
    <button
      type="button"
      ref={(el) => props.registerIcon(origin, el)}
      data-mobile="launcher"
      onClick={() => props.onLaunch(entry.id, origin)}
      className="flex min-w-0 flex-col items-center gap-1.5 outline-none select-none"
    >
      <motion.span
        layoutId={props.reducedMotion ? undefined : origin}
        data-mobile="icon"
        className="block shrink-0"
        style={{ width: 'var(--mobile-icon-size, 60px)', height: 'var(--mobile-icon-size, 60px)' }}
      >
        {entry.icon}
      </motion.span>
      {/* Dock icons are labelled for assistive tech only (see the skin CSS); the grid shows its labels. */}
      <span data-mobile="label" className="max-w-full truncate">
        {entry.title}
      </span>
    </button>
  );
}

/** The launcher: an icon grid (4 columns by default), page dots and a dock. */
export function HomeScreen(props: HomeScreenProps) {
  const { grid, dock, covered } = props;
  return (
    <div
      data-mobile="home"
      inert={covered}
      className="absolute inset-0 flex flex-col"
      style={{
        paddingTop: 'var(--mobile-status-height, 44px)',
        paddingBottom: 'var(--mobile-nav-height, 34px)',
      }}
    >
      <ul
        aria-label="Home screen"
        data-mobile="grid"
        className="grid flex-1 content-start"
        style={{ gridTemplateColumns: 'repeat(var(--mobile-grid-columns, 4), minmax(0, 1fr))' }}
      >
        {grid.map((entry) => (
          <li key={entry.id} className="flex justify-center">
            <Launcher entry={entry} place="grid" props={props} />
          </li>
        ))}
      </ul>
      <div aria-hidden data-mobile="page-dots" className="flex justify-center">
        <span data-active="true" />
      </div>
      <nav aria-label="Dock" data-mobile="dock">
        <ul className="grid" style={{ gridTemplateColumns: `repeat(${dock.length}, minmax(0, 1fr))` }}>
          {dock.map((entry) => (
            <li key={entry.id} className="flex justify-center">
              <Launcher entry={entry} place="dock" props={props} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
