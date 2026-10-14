'use client';

import { Minus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { WindowChromeProps } from '@/os/core/desktop/window';

function HeaderButton({ label, onClick, close, children }: { label: string; onClick(): void; close?: boolean; children: ReactNode }) {
  const hover = close
    ? 'hover:bg-(--ubu-orange) hover:text-white focus-visible:bg-(--ubu-orange) focus-visible:text-white'
    : 'hover:bg-(--ubu-button-hover) focus-visible:bg-(--ubu-button-hover)';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex size-6 items-center justify-center rounded-full bg-(--ubu-button) text-(--os-fg) outline-none transition-colors duration-100 active:bg-(--ubu-button-active) focus-visible:ring-2 focus-visible:ring-(--ubu-orange) focus-visible:ring-offset-1 focus-visible:ring-offset-(--ubu-headerbar) ${hover}`}
    >
      {children}
    </button>
  );
}

/** Maximize is a square outline; restore shows two overlapping squares. Hand-drawn, 16px grid. */
function MaximizeGlyph({ maximized }: { maximized: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
      {maximized ? (
        <>
          <rect x="3" y="5.5" width="7.5" height="7.5" rx="1.2" />
          <path d="M5.5 3h6.3c.7 0 1.2.5 1.2 1.2v6.3" />
        </>
      ) : (
        <rect x="3.5" y="3.5" width="9" height="9" rx="1.4" />
      )}
    </svg>
  );
}

/** Yaru dark window: a headerbar with the title centred and round buttons on the right. */
export function UbuntuWindowChrome({ title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const maximized = mode === 'maximized';
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 -z-10 bg-(--ubu-window) transition-shadow duration-150 ${
          maximized ? 'rounded-none' : 'rounded-xl border border-(--ubu-window-stroke)'
        } ${focused ? 'shadow-(--ubu-shadow)' : 'shadow-(--ubu-shadow-unfocused)'}`}
      />
      <div
        {...dragHandleProps}
        className={`relative flex h-10 shrink-0 items-center justify-center border-b border-(--ubu-headerbar-stroke) px-28 ${
          maximized ? '' : 'rounded-t-xl'
        } ${focused ? 'bg-(--ubu-headerbar)' : 'bg-(--ubu-headerbar-unfocused)'} ${dragHandleProps.className ?? ''}`}
      >
        <span className={`truncate text-[14px] font-bold ${focused ? 'text-(--os-fg)' : 'text-(--os-muted)'}`}>{title}</span>
        <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-2.5">
          <HeaderButton label="Minimize" onClick={onMinimize}>
            <Minus aria-hidden className="size-3.5" strokeWidth={2.4} />
          </HeaderButton>
          <HeaderButton label={maximized ? 'Restore' : 'Maximize'} onClick={onToggleMaximize}>
            <MaximizeGlyph maximized={maximized} />
          </HeaderButton>
          <HeaderButton label="Close" onClick={onClose} close>
            <X aria-hidden className="size-3.5" strokeWidth={2.4} />
          </HeaderButton>
        </div>
      </div>
    </>
  );
}
