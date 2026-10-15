import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BootGate } from './boot';

const Screen = () => <p>Booting test OS</p>;
const KEY = 'os-booted-windows11';

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: matches && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

const renderGate = (durationMs?: number) =>
  render(
    <BootGate id="windows11" Screen={Screen} durationMs={durationMs}>
      <p>Desktop</p>
    </BootGate>,
  );

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  mockReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('BootGate', () => {
  it('shows the boot screen on a first visit, then hides it and sets the flag after the duration', () => {
    renderGate();
    expect(screen.getByText('Booting test OS')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
    act(() => vi.advanceTimersByTime(1199));
    expect(screen.getByText('Booting test OS')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(window.sessionStorage.getItem(KEY)).toBe('1');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Booting test OS')).toBeNull();
  });

  it('skips the boot screen when the session flag is set', () => {
    window.sessionStorage.setItem(KEY, '1');
    renderGate();
    expect(screen.queryByText('Booting test OS')).toBeNull();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('skips the boot screen under reduced motion', () => {
    mockReducedMotion(true);
    renderGate();
    expect(screen.queryByText('Booting test OS')).toBeNull();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('a click skips the boot screen and sets the flag', () => {
    renderGate();
    fireEvent.click(screen.getByTestId('boot-screen'));
    expect(window.sessionStorage.getItem(KEY)).toBe('1');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Booting test OS')).toBeNull();
  });

  it.each(['Enter', 'Escape', ' '])('%j skips the boot screen', (key) => {
    renderGate();
    fireEvent.keyDown(window, { key });
    expect(window.sessionStorage.getItem(KEY)).toBe('1');
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Booting test OS')).toBeNull();
  });

  it('Tab and modifier keys do not skip the boot screen', () => {
    renderGate();
    for (const key of ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock']) fireEvent.keyDown(window, { key });
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
    expect(screen.getByText('Booting test OS')).toBeInTheDocument();
  });

  it('caps the duration at 1500ms', () => {
    renderGate(5000);
    act(() => vi.advanceTimersByTime(1500));
    expect(window.sessionStorage.getItem(KEY)).toBe('1');
  });
});
