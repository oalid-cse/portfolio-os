'use client';

import { motion } from 'framer-motion';
import { type ComponentType, type CSSProperties, type HTMLAttributes, type PointerEvent, type ReactNode, useEffect, useRef } from 'react';
import type { AppId } from '../types';
import { type Geometry, MIN_H, MIN_W, type WinState } from './window-store';

export type WindowChromeProps = {
  appId: AppId;
  title: string;
  focused: boolean;
  mode: WinState['mode'];
  onClose(): void;
  onMinimize(): void;
  onToggleMaximize(): void;
  /**
   * Pointer, double-click and class props that make an element the window's drag handle.
   * Chromes must spread these onto the title bar element (and merge, not replace, `className`).
   */
  dragHandleProps: HTMLAttributes<HTMLElement>;
};

export type WindowProps = {
  win: WinState;
  focused: boolean;
  Chrome: ComponentType<WindowChromeProps>;
  reducedMotion: boolean;
  onFocus(): void;
  onClose(): void;
  onMinimize(): void;
  onToggleMaximize(): void;
  onMove(x: number, y: number): void;
  /** Atomic geometry update used by edge/corner resizing. */
  onSetBounds(bounds: Geometry): void;
  children: ReactNode;
};

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
type Gesture = { kind: 'move' | Edge; px: number; py: number; x: number; y: number; w: number; h: number };

const HANDLE = 8;
const EDGE_STYLE: Record<Edge, CSSProperties> = {
  n: { top: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: 'ns-resize' },
  s: { bottom: -HANDLE / 2, left: HANDLE, right: HANDLE, height: HANDLE, cursor: 'ns-resize' },
  e: { right: -HANDLE / 2, top: HANDLE, bottom: HANDLE, width: HANDLE, cursor: 'ew-resize' },
  w: { left: -HANDLE / 2, top: HANDLE, bottom: HANDLE, width: HANDLE, cursor: 'ew-resize' },
  ne: { top: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nesw-resize' },
  sw: { bottom: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nesw-resize' },
  nw: { top: -HANDLE / 2, left: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nwse-resize' },
  se: { bottom: -HANDLE / 2, right: -HANDLE / 2, width: HANDLE * 2, height: HANDLE * 2, cursor: 'nwse-resize' },
};
const EDGES = Object.keys(EDGE_STYLE) as Edge[];

const fromButton = (e: { target: EventTarget }) => e.target instanceof Element && e.target.closest('button') !== null;

export function Window(props: WindowProps) {
  const { win, focused, Chrome, reducedMotion, onFocus, onClose, onMinimize, onToggleMaximize, children } = props;
  const ref = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const minimized = win.mode === 'minimized';
  const maximized = win.mode === 'maximized';

  // Move keyboard focus into the window when it opens or becomes the focused window,
  // unless something inside it (e.g. an autoFocus input) already has focus.
  useEffect(() => {
    const el = ref.current;
    if (focused && !minimized && el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, [focused, minimized]);

  const begin = (kind: Gesture['kind'], e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || maximized) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    gesture.current = { kind, px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
  };
  const beginMove = (e: PointerEvent<HTMLElement>) => {
    if (!fromButton(e)) begin('move', e);
  };
  const beginResize = (e: PointerEvent<HTMLElement>) => begin(e.currentTarget.dataset.resize as Edge, e);

  const track = (e: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g) return;
    if (e.buttons === 0) {
      // The button was released without us seeing pointerup (e.g. outside the window): stop.
      gesture.current = null;
      return;
    }
    const dx = e.clientX - g.px;
    const dy = e.clientY - g.py;
    if (g.kind === 'move') return props.onMove(g.x + dx, g.y + dy);
    let { x, y, w, h } = g;
    if (g.kind.includes('e')) w = Math.max(MIN_W, g.w + dx);
    if (g.kind.includes('s')) h = Math.max(MIN_H, g.h + dy);
    if (g.kind.includes('w')) {
      w = Math.max(MIN_W, g.w - dx);
      x = g.x + g.w - w;
    }
    if (g.kind.includes('n')) {
      h = Math.max(MIN_H, g.h - dy);
      y = g.y + g.h - h;
    }
    props.onSetBounds({ x, y, w, h });
  };

  const end = (e: PointerEvent<HTMLElement>) => {
    if (!gesture.current) return;
    gesture.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const pointerEnd = { onPointerUp: end, onPointerCancel: end, onLostPointerCapture: end };

  const dragHandleProps: HTMLAttributes<HTMLElement> = {
    onPointerDown: beginMove,
    onPointerMove: track,
    ...pointerEnd,
    onDoubleClick: (e) => {
      if (!fromButton(e)) onToggleMaximize();
    },
    className: 'touch-none select-none',
  };

  const duration = reducedMotion ? 0 : 0.15;

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={win.title}
      aria-hidden={minimized || undefined}
      inert={minimized}
      tabIndex={-1}
      onPointerDownCapture={() => {
        if (!focused) onFocus();
      }}
      className="pointer-events-auto absolute flex flex-col outline-none"
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
      animate={
        minimized
          ? { opacity: 0, scale: 0.9, transitionEnd: { visibility: 'hidden' } }
          : { opacity: 1, scale: 1, visibility: 'visible' }
      }
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration, ease: 'easeOut' }}
    >
      <Chrome
        appId={win.appId}
        title={win.title}
        focused={focused}
        mode={win.mode}
        onClose={onClose}
        onMinimize={onMinimize}
        onToggleMaximize={onToggleMaximize}
        dragHandleProps={dragHandleProps}
      />
      <div className="min-h-0 flex-1 select-text">{children}</div>
      {!maximized &&
        EDGES.map((edge) => (
          <div
            key={edge}
            aria-hidden
            data-resize={edge}
            className="absolute touch-none select-none"
            style={EDGE_STYLE[edge]}
            onPointerDown={beginResize}
            onPointerMove={track}
            {...pointerEnd}
          />
        ))}
    </motion.div>
  );
}
