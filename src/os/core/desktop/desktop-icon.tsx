'use client';

import type { KeyboardEvent, ReactNode } from 'react';

export type DesktopIconProps = {
  title: string;
  icon: ReactNode;
  selected: boolean;
  onSelect(): void;
  onOpen(): void;
};

/** A desktop shortcut: single click selects, double-click or Enter opens. */
export function DesktopIcon({ title, icon, selected, onSelect, onOpen }: DesktopIconProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={onKeyDown}
      className={`flex w-20 flex-col items-center gap-1 rounded-md p-1.5 text-center text-xs text-white outline-none [text-shadow:0_1px_2px_rgb(0_0_0/0.8)] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/70 ${
        selected ? 'bg-white/20 ring-1 ring-white/50' : ''
      }`}
    >
      <span aria-hidden className="flex size-12 items-center justify-center">
        {icon}
      </span>
      <span className="line-clamp-2 break-words">{title}</span>
    </button>
  );
}
