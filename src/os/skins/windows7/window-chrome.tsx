'use client';

import type { ReactNode } from 'react';
import { apps } from '@/os/core/apps';
import type { WindowChromeProps } from '@/os/core/desktop/window';
import { AppGem } from './icons';

/** Small bold caption glyphs with a dark outline so they read on glass and on the red close. */
function CaptionGlyph({ kind }: { kind: 'minimize' | 'maximize' | 'restore' | 'close' }) {
  return (
    <svg aria-hidden viewBox="0 0 12 10" className="w7-caption-glyph h-2.5 w-3" fill="none" stroke="currentColor" strokeLinecap="square">
      {kind === 'minimize' && <path d="M2.5 7.5h6" strokeWidth="2" />}
      {kind === 'maximize' && <rect x="2" y="1.5" width="8" height="6.5" strokeWidth="1.6" />}
      {kind === 'restore' && (
        <>
          <rect x="1.5" y="3.5" width="6.5" height="5" strokeWidth="1.4" />
          <path d="M4 1.5h6.5v5" strokeWidth="1.4" />
        </>
      )}
      {kind === 'close' && <path d="M3 1.5l6 6.5M9 1.5l-6 6.5" strokeWidth="2" strokeLinecap="round" />}
    </svg>
  );
}

function CaptionButton({ label, onClick, kind, className, children }: { label: string; onClick(): void; kind: 'plain' | 'close'; className: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`w7-caption flex h-5 items-center justify-center text-white outline-none ${kind === 'close' ? 'w7-caption-close w-[47px]' : 'w-[27px]'} ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * Aero-style glass frame: a blurred, tinted translucent layer behind the whole window with
 * rounded top corners and a thin dark outline over a white inner rim. The app body sits inset
 * inside the glass (see `.w7-titlebar + *` in theme.css) on a solid surface so it stays readable.
 * Caption buttons hang from the top edge, with the wide glossy red close at the end.
 */
export function Win7WindowChrome({ appId, title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const maximized = mode === 'maximized';

  return (
    <>
      <div
        aria-hidden
        data-focused={focused || undefined}
        data-maximized={maximized || undefined}
        className={`w7-glass w7-frame pointer-events-none absolute inset-0 -z-10 ${maximized ? '' : 'rounded-t-lg'}`}
      />
      <div
        {...dragHandleProps}
        data-maximized={maximized || undefined}
        className={`w7-titlebar relative flex h-[30px] shrink-0 items-start ${dragHandleProps.className ?? ''}`}
      >
        <div className={`flex h-full min-w-0 flex-1 items-center gap-1.5 pr-2 pl-2 text-xs ${focused ? 'text-(--w7-title-fg)' : 'text-(--w7-title-fg-unfocused)'}`}>
          <AppGem app={apps[appId].icon} size="xs" />
          <span className="w7-title-text -my-2 -ml-3 truncate px-3 py-2">{title}</span>
        </div>
        <div className={`w7-captions flex shrink-0 ${maximized ? 'mr-0.5' : 'mr-1.5'} ${focused ? '' : 'opacity-75'}`}>
          <CaptionButton label="Minimize" onClick={onMinimize} kind="plain" className="rounded-bl-[5px]">
            <CaptionGlyph kind="minimize" />
          </CaptionButton>
          <CaptionButton label={maximized ? 'Restore' : 'Maximize'} onClick={onToggleMaximize} kind="plain" className="border-x border-(--w7-caption-divider)">
            <CaptionGlyph kind={maximized ? 'restore' : 'maximize'} />
          </CaptionButton>
          <CaptionButton label="Close" onClick={onClose} kind="close" className="rounded-br-[5px]">
            <CaptionGlyph kind="close" />
          </CaptionButton>
        </div>
      </div>
    </>
  );
}
