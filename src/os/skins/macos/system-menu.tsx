'use client';

import { ChevronRight } from 'lucide-react';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import { BackToClassic } from '@/os/core/back-to-classic';
import { OsSwitcher } from '@/os/core/os-switcher';

export type SystemMenuProps = {
  onAbout(): void;
  /** `restoreFocus` is true when the menu was dismissed from the keyboard. */
  onClose(restoreFocus: boolean): void;
  /** Clicks on this element (the menu's own button) are not "outside" clicks; it toggles the menu. */
  ignoreRef: RefObject<HTMLElement | null>;
};

const ITEM =
  'flex w-full items-center justify-between gap-6 rounded-[5px] px-2.5 py-[3px] text-left text-[13px] leading-5 outline-none hover:bg-(--mac-highlight) focus-visible:bg-(--mac-highlight)';
const PANEL =
  'mac-vibrancy mac-menu-in rounded-lg border border-(--mac-menu-stroke) bg-(--mac-menu) p-[5px] text-(--os-fg) shadow-(--mac-menu-shadow)';
const SEPARATOR = <hr aria-hidden className="mx-2.5 my-[5px] border-(--mac-separator)" />;

/** The drop-down under the menu bar's system glyph. */
export function SystemMenu({ onAbout, onClose, ignoreRef }: SystemMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [switching, setSwitching] = useState(false);
  const submenuId = useId();

  // Latest onClose without re-subscribing (the parent passes a fresh closure each render).
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || ignoreRef.current?.contains(target)) return;
      close.current(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current(true);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ignoreRef]);

  return (
    <div ref={ref} role="group" aria-label="System menu" className={`absolute top-full left-0 mt-px min-w-60 ${PANEL}`}>
      <button type="button" className={ITEM} onClick={onAbout} onPointerEnter={() => setSwitching(false)}>
        About this portfolio
      </button>
      {SEPARATOR}
      <div className="relative">
        <button
          type="button"
          aria-expanded={switching}
          aria-controls={submenuId}
          onClick={() => setSwitching(true)}
          onPointerEnter={() => setSwitching(true)}
          className={`${ITEM} ${switching ? 'bg-(--mac-highlight)' : ''}`}
        >
          Switch OS…
          <ChevronRight aria-hidden size={13} strokeWidth={2.25} className="opacity-70" />
        </button>
        {switching && (
          <div
            id={submenuId}
            className={`absolute top-0 left-full ml-1 min-w-52 whitespace-nowrap ${PANEL} [&_a]:rounded-[5px] [&_a]:px-2.5 [&_a]:py-[3px] [&_a]:text-[13px] [&_a:hover]:bg-(--mac-highlight) [&_a:focus-visible]:bg-(--mac-highlight) [&_a]:outline-none [&_span[aria-disabled]]:px-2.5 [&_span[aria-disabled]]:py-[3px] [&_span[aria-disabled]]:text-[13px] [&_span[aria-disabled]]:text-(--os-muted) [&_span[aria-disabled]]:opacity-100 [&_span_span]:ml-1.5 [&_span_span]:opacity-70`}
          >
            <OsSwitcher current="macos" variant="menu" />
          </div>
        )}
      </div>
      {SEPARATOR}
      <div onPointerEnter={() => setSwitching(false)}>
        <BackToClassic className={ITEM} />
      </div>
    </div>
  );
}
