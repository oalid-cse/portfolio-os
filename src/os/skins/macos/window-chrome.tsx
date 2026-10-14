'use client';

import { Minus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WindowChromeProps } from '@/os/core/desktop/window';

const LIGHT_COLOR = {
  close: 'group-hover:bg-(--mac-light-close)',
  minimize: 'group-hover:bg-(--mac-light-minimize)',
  zoom: 'group-hover:bg-(--mac-light-zoom)',
} as const;
const FOCUSED_COLOR = {
  close: 'bg-(--mac-light-close)',
  minimize: 'bg-(--mac-light-minimize)',
  zoom: 'bg-(--mac-light-zoom)',
} as const;

function TrafficLight({
  kind,
  label,
  focused,
  onClick,
  children,
}: {
  kind: keyof typeof LIGHT_COLOR;
  label: string;
  focused: boolean;
  onClick(): void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex size-3 items-center justify-center rounded-full text-(--mac-light-glyph) shadow-[inset_0_0_0_0.5px_var(--mac-light-ring)] outline-none focus-visible:ring-2 focus-visible:ring-(--os-accent) focus-visible:ring-offset-1 focus-visible:ring-offset-transparent ${
        focused ? FOCUSED_COLOR[kind] : `bg-(--mac-light-idle) ${LIGHT_COLOR[kind]}`
      }`}
    >
      {children}
    </button>
  );
}

/** Zoom glyph: two small triangles pointing at opposite corners (inward when zoomed). */
function ZoomGlyph({ zoomed }: { zoomed: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className="size-2" fill="currentColor">
      {zoomed ? (
        <>
          <path d="M5.4 6.6v3.8L1.6 6.6z" />
          <path d="M6.6 5.4V1.6l3.8 3.8z" />
        </>
      ) : (
        <>
          <path d="M2 10V5.2L6.8 10z" />
          <path d="M10 2v4.8L5.2 2z" />
        </>
      )}
    </svg>
  );
}

/**
 * macOS-style window frame: traffic lights on the left, a centred title, and a vibrant surface
 * layer behind both the title bar and the engine-rendered app body.
 */
export function MacWindowChrome({ title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const zoomed = mode === 'maximized';
  return (
    <>
      <div
        aria-hidden
        className={`mac-vibrancy pointer-events-none absolute inset-0 -z-10 transition-shadow duration-150 ${
          zoomed ? 'rounded-none' : 'rounded-xl border border-(--mac-window-stroke)'
        } ${focused ? 'bg-(--mac-window) shadow-(--mac-shadow)' : 'bg-(--mac-window-unfocused) shadow-(--mac-shadow-unfocused)'}`}
      >
        <div className={`absolute inset-0 ${zoomed ? '' : 'rounded-xl'} shadow-(--mac-window-highlight)`} />
      </div>
      <div
        {...dragHandleProps}
        data-mac-zoomed={zoomed || undefined}
        className={`relative flex h-10 shrink-0 items-center justify-center border-b border-(--mac-separator) px-20 ${dragHandleProps.className ?? ''}`}
      >
        <div className="mac-lights group absolute top-1/2 left-3.5 flex -translate-y-1/2 items-center gap-2">
          <TrafficLight kind="close" label="Close" focused={focused} onClick={onClose}>
            <X aria-hidden className="size-2" strokeWidth={3.25} />
          </TrafficLight>
          <TrafficLight kind="minimize" label="Minimize" focused={focused} onClick={onMinimize}>
            <Minus aria-hidden className="size-2" strokeWidth={3.25} />
          </TrafficLight>
          <TrafficLight kind="zoom" label="Zoom" focused={focused} onClick={onToggleMaximize}>
            <ZoomGlyph zoomed={zoomed} />
          </TrafficLight>
        </div>
        <span className={`truncate text-[13px] font-semibold ${focused ? 'text-(--os-fg)' : 'text-(--os-muted)'}`}>{title}</span>
      </div>
    </>
  );
}
