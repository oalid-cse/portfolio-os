'use client';

import { type MotionValue, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ALL_APP_IDS, apps } from '@/os/core/apps';
import type { DesktopApi } from '@/os/core/desktop/desktop-shell';
import { useReducedMotion } from '@/os/core/desktop/use-reduced-motion';
import type { AppId } from '@/os/core/types';
import { AppIcon } from './icons';

const BASE = 50;
const PEAK = 80;
/** Horizontal distance (px) from an icon's centre over which magnification falls off. */
const REACH = 140;
const SPRING = { mass: 0.1, stiffness: 170, damping: 12 };

function DockItem({
  id,
  pointerX,
  reducedMotion,
  running,
  onActivate,
}: {
  id: AppId;
  pointerX: MotionValue<number>;
  reducedMotion: boolean;
  running: boolean;
  onActivate(): void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const distance = useTransform(pointerX, (x) => {
    const box = ref.current?.getBoundingClientRect();
    return box ? x - box.left - box.width / 2 : Infinity;
  });
  const target = useTransform(distance, [-REACH, 0, REACH], [BASE, PEAK, BASE]);
  const size = useSpring(target, SPRING);
  const { title, icon } = apps[id];

  return (
    <li className="relative flex flex-col items-center">
      <motion.button
        ref={ref}
        type="button"
        aria-label={title}
        onClick={onActivate}
        style={reducedMotion ? { width: BASE, height: BASE } : { width: size, height: size }}
        className="group relative flex items-end justify-center rounded-[23%] outline-none focus-visible:ring-2 focus-visible:ring-white/80"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 rounded-md border border-(--mac-menu-stroke) bg-(--mac-tooltip) px-2.5 py-0.5 text-[13px] whitespace-nowrap text-(--os-fg) opacity-0 shadow-(--mac-menu-shadow) transition-opacity duration-100 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {title}
        </span>
        <AppIcon app={icon} />
      </motion.button>
      <span
        aria-hidden
        className={`absolute -bottom-[7px] size-1 rounded-full bg-(--mac-indicator) transition-opacity ${running ? 'opacity-100' : 'opacity-0'}`}
      />
    </li>
  );
}

/** The Dock: every app, a running dot under open ones, and pointer-driven magnification. */
export function Dock({ api }: { api: DesktopApi }) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(Infinity);

  // macOS behaviour: a Dock click never minimizes; it opens, restores or brings the app forward.
  const activate = (id: AppId) => {
    const win = api.windows.find((w) => w.appId === id);
    if (win) api.focus(win.id);
    else api.openApp(id);
  };

  return (
    <div className="flex h-full items-end justify-center pb-1.5">
      <nav
        aria-label="Dock"
        onPointerMove={reducedMotion ? undefined : (e) => pointerX.set(e.clientX)}
        onPointerLeave={() => pointerX.set(Infinity)}
        className="mac-vibrancy rounded-[22px] border border-(--mac-dock-stroke) bg-(--mac-dock) px-2 pt-1.5 pb-2 shadow-[0_10px_30px_rgb(0_0_0/0.3)]"
      >
        <ul className="flex h-[50px] items-end gap-2">
          {ALL_APP_IDS.map((id) => (
            <DockItem
              key={id}
              id={id}
              pointerX={pointerX}
              reducedMotion={reducedMotion}
              running={api.windows.some((w) => w.appId === id)}
              onActivate={() => activate(id)}
            />
          ))}
        </ul>
      </nav>
    </div>
  );
}
