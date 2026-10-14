'use client';

import { type PointerEvent, type ReactNode, useEffect, useRef } from 'react';

/** A swipe must start this close to the bottom edge of the screen… */
export const SWIPE_EDGE_PX = 24;
/** …and travel at least this far up to count as "go home". */
export const SWIPE_DISTANCE_PX = 80;

export type DeviceFrameProps = {
  /** Called when a swipe up from the bottom edge completes. */
  onSwipeHome(): void;
  children: ReactNode;
};

/**
 * Full-screen below 768px. From 768px up: a centered 390×844 screen inside a rounded bezel on a
 * neutral backdrop (scaled down to fit short viewports). Skins restyle the parts through
 * `[data-mobile='backdrop' | 'frame' | 'screen']`.
 *
 * The swipe-home gesture is observed, never captured: listeners sit on the screen and the window,
 * nothing overlays the content, and no default is prevented, so taps on app content still work.
 */
export function DeviceFrame({ onSwipeHome, children }: DeviceFrameProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const onSwipe = useRef(onSwipeHome);
  useEffect(() => {
    onSwipe.current = onSwipeHome;
  });
  useEffect(() => () => cleanupRef.current?.(), []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const rect = screenRef.current?.getBoundingClientRect();
    if (!rect || e.clientY < rect.bottom - SWIPE_EDGE_PX) return;
    cleanupRef.current?.();
    startY.current = e.clientY;
    const pointerId = e.pointerId;

    const finish = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const from = startY.current;
      cleanupRef.current?.();
      if (from !== null && from - ev.clientY > SWIPE_DISTANCE_PX) onSwipe.current();
    };
    // A touch drag that the browser takes over ends in pointercancel; the last move still counts.
    const move = (ev: globalThis.PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      if (startY.current !== null && startY.current - ev.clientY > SWIPE_DISTANCE_PX) finish(ev);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    cleanupRef.current = () => {
      startY.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      cleanupRef.current = null;
    };
  };

  return (
    <div
      data-mobile="backdrop"
      className="flex h-dvh w-full items-center justify-center overflow-hidden md:bg-neutral-800"
    >
      <div
        data-testid="device-frame"
        data-mobile="frame"
        className="relative size-full md:size-auto md:rounded-[64px] md:bg-neutral-950 md:p-3 md:shadow-2xl md:ring-1 md:ring-neutral-600"
      >
        <div
          ref={screenRef}
          data-testid="device-screen"
          data-mobile="screen"
          onPointerDown={onPointerDown}
          className="relative isolate size-full overflow-hidden md:aspect-[390/844] md:h-[min(844px,calc(100dvh-56px))] md:w-auto md:rounded-[52px]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
