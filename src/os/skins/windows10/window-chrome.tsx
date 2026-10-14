'use client';

import type { ReactNode } from 'react';
import { apps } from '@/os/core/apps';
import type { WindowChromeProps } from '@/os/core/desktop/window';
import { AppSquare } from './icons';

/** Hairline caption glyphs drawn on a 10px grid, as thin as the originals. */
function CaptionGlyph({ kind }: { kind: 'minimize' | 'maximize' | 'restore' | 'close' }) {
  return (
    <svg aria-hidden viewBox="0 0 10 10" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1" shapeRendering="crispEdges">
      {kind === 'minimize' && <path d="M0 5.5h10" />}
      {kind === 'maximize' && <rect x="0.5" y="0.5" width="9" height="9" />}
      {kind === 'restore' && (
        <>
          <rect x="0.5" y="2.5" width="7" height="7" />
          <path d="M2.5 2.5v-2h7v7h-2" />
        </>
      )}
      {kind === 'close' && <path d="M0.5 0.5l9 9M9.5 0.5l-9 9" shapeRendering="geometricPrecision" />}
    </svg>
  );
}

function CaptionButton({ label, onClick, danger, children }: { label: string; onClick(): void; danger?: boolean; children: ReactNode }) {
  const hover = danger
    ? 'hover:bg-(--w10-close) hover:text-white active:bg-(--w10-close-pressed) focus-visible:bg-(--w10-close) focus-visible:text-white'
    : 'hover:bg-(--w10-caption-hover) active:bg-(--w10-caption-pressed) focus-visible:bg-(--w10-caption-hover)';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-full w-[46px] items-center justify-center outline-none ${hover}`}
    >
      {children}
    </button>
  );
}

/**
 * Windows 10-style window frame: square corners, a white title bar, a one-pixel accent border
 * while focused and a soft drop shadow. The frame is a layer behind the title bar and app body.
 */
export function Win10WindowChrome({ appId, title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const maximized = mode === 'maximized';
  const shadow = maximized ? '' : focused ? 'shadow-(--w10-shadow)' : 'shadow-(--w10-shadow-unfocused)';
  const border = focused ? 'border-(--w10-accent)' : 'border-(--w10-frame-unfocused)';

  return (
    <>
      <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 bg-(--os-bg) ${shadow}`} />
      {/* The one-pixel frame sits above the app body so the body cannot paint over it. */}
      {!maximized && <div aria-hidden className={`pointer-events-none absolute inset-0 z-10 border ${border}`} />}
      <div
        {...dragHandleProps}
        className={`flex h-8 shrink-0 items-stretch bg-(--w10-title) ${
          focused ? 'text-(--w10-title-fg)' : 'text-(--w10-title-fg-unfocused)'
        } ${dragHandleProps.className ?? ''}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-2 text-xs">
          <AppSquare app={apps[appId].icon} size="xs" />
          <span className="truncate">{title}</span>
        </div>
        <div className="flex">
          <CaptionButton label="Minimize" onClick={onMinimize}>
            <CaptionGlyph kind="minimize" />
          </CaptionButton>
          <CaptionButton label={maximized ? 'Restore' : 'Maximize'} onClick={onToggleMaximize}>
            <CaptionGlyph kind={maximized ? 'restore' : 'maximize'} />
          </CaptionButton>
          <CaptionButton label="Close" onClick={onClose} danger>
            <CaptionGlyph kind="close" />
          </CaptionButton>
        </div>
      </div>
    </>
  );
}
