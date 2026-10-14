'use client';

import { Copy, Minus, Square, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { apps } from '@/os/core/apps';
import type { WindowChromeProps } from '@/os/core/desktop/window';
import { AppTile } from './icons';

const appByTitle = (title: string) => Object.values(apps).find((a) => a.title === title);

function CaptionButton({
  label,
  onClick,
  danger,
  className = '',
  children,
}: {
  label: string;
  onClick(): void;
  danger?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const hover = danger
    ? 'hover:bg-(--w11-close) hover:text-white active:bg-(--w11-close-pressed) focus-visible:bg-(--w11-close)'
    : 'hover:bg-(--w11-hover) active:bg-(--w11-pressed) focus-visible:bg-(--w11-hover)';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-full w-[46px] items-center justify-center outline-none transition-colors duration-100 ${hover} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Windows 11-style window frame. The engine renders the app body below the title bar, so the
 * Mica surface (background, stroke, radius, shadow) is an absolutely positioned layer behind both.
 */
export function Win11WindowChrome({ title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const maximized = mode === 'maximized';
  const app = appByTitle(title);

  return (
    <>
      <div
        aria-hidden
        className={`w11-acrylic pointer-events-none absolute inset-0 -z-10 transition-shadow duration-150 ${maximized ? 'rounded-none' : 'rounded-lg border border-(--w11-stroke-strong)'} ${
          focused ? 'bg-(--w11-surface) shadow-(--w11-shadow)' : 'bg-(--w11-surface-unfocused) shadow-(--w11-shadow-unfocused)'
        }`}
      />
      <div
        {...dragHandleProps}
        data-w11-maximized={maximized || undefined}
        className={`flex h-10 shrink-0 items-stretch overflow-hidden ${maximized ? '' : 'rounded-t-lg'} ${dragHandleProps.className ?? ''}`}
      >
        <div className={`flex min-w-0 flex-1 items-center gap-3 pl-3.5 text-xs ${focused ? 'text-(--os-fg)' : 'text-(--os-muted) opacity-80'}`}>
          {app && <AppTile app={app.icon} size="sm" />}
          <span className="truncate">{title}</span>
        </div>
        <div className={`flex ${focused ? 'text-(--os-fg)' : 'text-(--os-muted)'}`}>
          <CaptionButton label="Minimize" onClick={onMinimize}>
            <Minus size={16} strokeWidth={1.25} />
          </CaptionButton>
          <CaptionButton label={maximized ? 'Restore' : 'Maximize'} onClick={onToggleMaximize}>
            {maximized ? (
              <Copy size={13} strokeWidth={1.25} className="-scale-x-100" />
            ) : (
              <Square size={12} strokeWidth={1.25} />
            )}
          </CaptionButton>
          <CaptionButton label="Close" onClick={onClose} danger className={maximized ? '' : 'rounded-tr-lg'}>
            <X size={16} strokeWidth={1.25} />
          </CaptionButton>
        </div>
      </div>
    </>
  );
}
