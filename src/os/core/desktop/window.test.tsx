import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TestChrome } from '../__fixtures__/test-chrome';
import type { WinState } from './window-store';
import { Window } from './window';

afterEach(cleanup);

const baseWin: WinState = { id: 'about-1', appId: 'about', title: 'About', x: 100, y: 80, w: 600, h: 400, z: 1, mode: 'normal' };

function setup(win: Partial<WinState> = {}, focused = true) {
  const handlers = {
    onFocus: vi.fn(),
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onToggleMaximize: vi.fn(),
    onMove: vi.fn(),
    onSetBounds: vi.fn(),
  };
  render(
    <Window win={{ ...baseWin, ...win }} focused={focused} Chrome={TestChrome} reducedMotion {...handlers}>
      <p>body</p>
    </Window>,
  );
  return handlers;
}

describe('Window', () => {
  it('renders a labelled dialog at its geometry and stacking order', () => {
    setup({ z: 7 });
    const dialog = screen.getByRole('dialog', { name: 'About' });
    expect(dialog).toHaveStyle({ left: '100px', top: '80px', width: '600px', height: '400px', zIndex: '7' });
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('tells the chrome which app it frames', () => {
    setup();
    expect(screen.getByTestId('titlebar')).toHaveAttribute('data-app-id', 'about');
  });

  it('moves focus into the window on open', () => {
    setup();
    expect(screen.getByRole('dialog', { name: 'About' })).toHaveFocus();
  });

  it('pointerdown anywhere focuses an unfocused window', () => {
    const h = setup({}, false);
    fireEvent.pointerDown(screen.getByText('body'));
    expect(h.onFocus).toHaveBeenCalled();
  });

  it('dragging the handle moves the window by the pointer delta', () => {
    const h = setup();
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 250, clientY: 130, pointerId: 1, buttons: 1 });
    expect(h.onMove).toHaveBeenLastCalledWith(150, 110);
    fireEvent.pointerUp(bar, { clientX: 250, clientY: 130, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 400, clientY: 400, pointerId: 1, buttons: 1 });
    expect(h.onMove).toHaveBeenCalledTimes(1);
  });

  it('does not drag from chrome buttons or while maximized', () => {
    const h = setup({ mode: 'maximized' });
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 250, clientY: 130, pointerId: 1, buttons: 1 });
    cleanup();
    const h2 = setup();
    const close = screen.getByRole('button', { name: 'Close' });
    fireEvent.pointerDown(close, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(close, { clientX: 250, clientY: 130, pointerId: 1, buttons: 1 });
    expect(h.onMove).not.toHaveBeenCalled();
    expect(h2.onMove).not.toHaveBeenCalled();
  });

  it('double-click on the drag handle toggles maximize', () => {
    const h = setup();
    fireEvent.doubleClick(screen.getByTestId('titlebar'));
    expect(h.onToggleMaximize).toHaveBeenCalledTimes(1);
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Close' }));
    expect(h.onToggleMaximize).toHaveBeenCalledTimes(1);
  });

  it('chrome buttons call close / minimize / toggleMaximize', () => {
    const h = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    expect(h.onClose).toHaveBeenCalled();
    expect(h.onMinimize).toHaveBeenCalled();
    expect(h.onToggleMaximize).toHaveBeenCalled();
  });

  it('east edge resizes width; west edge resizes and moves atomically', () => {
    const h = setup();
    const dialog = screen.getByRole('dialog', { name: 'About' });
    const east = dialog.querySelector('[data-resize="e"]')!;
    fireEvent.pointerDown(east, { clientX: 700, clientY: 200, pointerId: 1, button: 0 });
    fireEvent.pointerMove(east, { clientX: 760, clientY: 260, pointerId: 1, buttons: 1 });
    expect(h.onSetBounds).toHaveBeenLastCalledWith({ x: 100, y: 80, w: 660, h: 400 });
    fireEvent.pointerUp(east, { pointerId: 1 });

    const west = dialog.querySelector('[data-resize="w"]')!;
    fireEvent.pointerDown(west, { clientX: 100, clientY: 200, pointerId: 1, button: 0 });
    fireEvent.pointerMove(west, { clientX: 60, clientY: 200, pointerId: 1, buttons: 1 });
    expect(h.onSetBounds).toHaveBeenLastCalledWith({ x: 60, y: 80, w: 640, h: 400 });
  });

  it('has 8 resize handles of 8px, hidden while maximized', () => {
    setup();
    const handles = screen.getByRole('dialog').querySelectorAll('[data-resize]');
    expect([...handles].map((e) => e.getAttribute('data-resize')).sort()).toEqual(
      ['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w'],
    );
    cleanup();
    setup({ mode: 'maximized' });
    expect(screen.getByRole('dialog').querySelectorAll('[data-resize]')).toHaveLength(0);
  });

  it('minimized windows are hidden from assistive tech and focus', () => {
    setup({ mode: 'minimized' }, false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('north edge keeps the bottom edge fixed and respects the minimum height', () => {
    const h = setup();
    const north = screen.getByRole('dialog').querySelector('[data-resize="n"]')!;
    fireEvent.pointerDown(north, { clientX: 300, clientY: 80, pointerId: 1, button: 0 });
    fireEvent.pointerMove(north, { clientX: 300, clientY: 20, pointerId: 1, buttons: 1 });
    expect(h.onSetBounds).toHaveBeenLastCalledWith({ x: 100, y: 20, w: 600, h: 460 });
    fireEvent.pointerMove(north, { clientX: 300, clientY: 900, pointerId: 1, buttons: 1 });
    expect(h.onSetBounds).toHaveBeenLastCalledWith({ x: 100, y: 280, w: 600, h: 200 });
  });

  it('losing pointer capture ends the drag', () => {
    const h = setup();
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.lostPointerCapture(bar, { pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 250, clientY: 130, pointerId: 1, buttons: 1 });
    expect(h.onMove).not.toHaveBeenCalled();
  });

  it('losing pointer capture ends a resize', () => {
    const h = setup();
    const east = screen.getByRole('dialog').querySelector('[data-resize="e"]')!;
    fireEvent.pointerDown(east, { clientX: 700, clientY: 200, pointerId: 1, button: 0 });
    fireEvent.lostPointerCapture(east, { pointerId: 1 });
    fireEvent.pointerMove(east, { clientX: 760, clientY: 200, pointerId: 1, buttons: 1 });
    expect(h.onSetBounds).not.toHaveBeenCalled();
  });

  it('a move with no buttons pressed ends a stuck drag', () => {
    const h = setup();
    const bar = screen.getByTestId('titlebar');
    fireEvent.pointerDown(bar, { clientX: 200, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 250, clientY: 130, pointerId: 1, buttons: 0 });
    fireEvent.pointerMove(bar, { clientX: 300, clientY: 160, pointerId: 1, buttons: 1 });
    expect(h.onMove).not.toHaveBeenCalled();
  });

  it('the drag handle is non-selectable while the content area allows text selection', () => {
    setup();
    expect(screen.getByTestId('titlebar')).toHaveClass('select-none', 'touch-none');
    expect(screen.getByText('body').parentElement).toHaveClass('select-text');
  });
});
