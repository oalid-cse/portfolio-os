'use client';

import type { ReactNode } from 'react';
import { apps } from '@/os/core/apps';
import type { WindowChromeProps } from '@/os/core/desktop/window';
import { AppTile } from './icons';

type GlyphKind = 'minimize' | 'maximize' | 'restore' | 'close';

/** Chunky white caption glyphs, drawn on a 21px grid like the era's bitmap captions. */
function CaptionGlyph({ kind }: { kind: GlyphKind }) {
  return (
    <svg aria-hidden viewBox="0 0 21 21" className="size-[21px]" fill="none" stroke="currentColor">
      {kind === 'minimize' && <path d="M5.5 14.5h6" strokeWidth="3" />}
      {kind === 'maximize' && (
        <>
          <rect x="5.5" y="5.5" width="10" height="10" strokeWidth="1.5" />
          <path d="M4.75 6.25h11.5" strokeWidth="3" />
        </>
      )}
      {kind === 'restore' && (
        <>
          <rect x="4.5" y="8.5" width="8" height="7" strokeWidth="1.5" />
          <path d="M3.75 9.25h9.5" strokeWidth="1.5" />
          <path d="M8.5 7.5v-2h8v7h-3M7.75 5.75h9.5" strokeWidth="1.5" />
        </>
      )}
      {kind === 'close' && <path d="M6.5 6.5l8 8M14.5 6.5l-8 8" strokeWidth="2.25" strokeLinecap="round" />}
    </svg>
  );
}

function CaptionButton({ label, onClick, close, children }: { label: string; onClick(): void; close?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`xp-caption flex size-[21px] items-center justify-center rounded-[3px] text-white outline-none ${close ? 'xp-caption-close' : ''}`}
    >
      {children}
    </button>
  );
}

/**
 * Luna-style frame: a thick blue border (drawn by a layer behind the window) with rounded top
 * corners, a glossy blue title bar with a bold white caption, and blue / red-orange caption
 * buttons. The app body is inset inside the border via the skin's `windowBodyClassName`.
 */
export function XpWindowChrome({ appId, title, focused, mode, onClose, onMinimize, onToggleMaximize, dragHandleProps }: WindowChromeProps) {
  const maximized = mode === 'maximized';
  const state = { 'data-focused': focused || undefined, 'data-maximized': maximized || undefined };

  return (
    <>
      <div aria-hidden {...state} className="xp-frame pointer-events-none absolute inset-0 -z-10" />
      <div {...dragHandleProps} {...state} className={`xp-titlebar relative flex h-[30px] shrink-0 items-center gap-1.5 pr-1.5 pl-2 ${dragHandleProps.className ?? ''}`}>
        <AppTile app={apps[appId].icon} size="xs" />
        <span className="xp-title min-w-0 flex-1 truncate text-[13px] font-bold">{title}</span>
        <div className="flex shrink-0 gap-0.5">
          <CaptionButton label="Minimize" onClick={onMinimize}>
            <CaptionGlyph kind="minimize" />
          </CaptionButton>
          <CaptionButton label={maximized ? 'Restore' : 'Maximize'} onClick={onToggleMaximize}>
            <CaptionGlyph kind={maximized ? 'restore' : 'maximize'} />
          </CaptionButton>
          <CaptionButton label="Close" onClick={onClose} close>
            <CaptionGlyph kind="close" />
          </CaptionButton>
        </div>
      </div>
    </>
  );
}
