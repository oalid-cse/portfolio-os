'use client';

import { type RefObject, useEffect, useRef } from 'react';

export type DismissReason = 'outside' | 'escape';

export type UseDismissOptions = {
  /** Pointer-downs inside this element (e.g. the menu's own toggle button) are not "outside". */
  ignoreRef?: RefObject<HTMLElement | null>;
  /** Extra "not outside" check, for toggles that are not a single element. */
  ignore?: (target: Node) => boolean;
  /** `'escape'` when dismissed from the keyboard (callers usually return focus then). */
  onClose(reason: DismissReason): void;
  enabled?: boolean;
};

/**
 * Closes a popup (menu, flyout, overview) on a pointer-down outside `ref` or on Escape.
 * The latest `onClose`/`ignore` are always used without re-subscribing, so callers may pass
 * fresh closures every render.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, { ignoreRef, ignore, onClose, enabled = true }: UseDismissOptions) {
  const latest = useRef({ onClose, ignore });
  useEffect(() => {
    latest.current = { onClose, ignore };
  });

  useEffect(() => {
    if (!enabled) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || ignoreRef?.current?.contains(target) || latest.current.ignore?.(target)) return;
      latest.current.onClose('outside');
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') latest.current.onClose('escape');
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, ignoreRef, enabled]);
}
