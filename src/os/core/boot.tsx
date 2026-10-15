'use client';

import { type ComponentType, type ReactNode, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { safeStorage } from '@/lib/safe-storage';
import { useReducedMotion } from './desktop/use-reduced-motion';
import type { OsId } from './types';

export const MAX_BOOT_MS = 1500;
const FADE_MS = 300;
const SKIP_KEYS = new Set(['Enter', 'Escape', ' ']);

export type BootGateProps = {
  id: OsId;
  /** Full-screen boot visual; rendered above the children while booting. */
  Screen: ComponentType;
  /** How long the boot screen stays up. Default 1200, capped at 1500. */
  durationMs?: number;
  children: ReactNode;
};

type Phase = 'booting' | 'leaving' | 'done';

const flagKey = (id: OsId) => `os-booted-${id}`;
const noSubscribe = () => () => {};

/**
 * Shows a skin's boot screen once per session. Skipped entirely with reduced motion or when
 * `sessionStorage['os-booted-<id>']` is set; a click, Enter, Escape or Space skips it early.
 */
export function BootGate({ id, Screen, durationMs = 1200, children }: BootGateProps) {
  const reducedMotion = useReducedMotion();
  // null while unknown (server render and hydration), then whether this session already booted.
  const booted = useSyncExternalStore(
    noSubscribe,
    () => safeStorage.get(flagKey(id), 'session') === '1',
    () => null,
  );
  const skip = booted === null ? null : booted || reducedMotion;
  const [phase, setPhase] = useState<Phase>('booting');

  const finish = useCallback(() => {
    safeStorage.set(flagKey(id), '1', 'session');
    setPhase((p) => (p === 'booting' ? 'leaving' : p));
  }, [id]);

  useEffect(() => {
    if (skip !== false || phase !== 'booting') return;
    const timer = window.setTimeout(finish, Math.min(durationMs, MAX_BOOT_MS));
    // Only deliberate keys skip: Tab or a modifier is someone starting to navigate, not dismissing.
    const onKeyDown = (e: KeyboardEvent) => {
      if (SKIP_KEYS.has(e.key)) finish();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [skip, phase, durationMs, finish]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    const timer = window.setTimeout(() => setPhase('done'), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const showScreen = phase === 'leaving' || (phase === 'booting' && skip === false);

  return (
    <>
      {children}
      {skip === null && phase === 'booting' && <div aria-hidden className="fixed inset-0 z-50 bg-black" />}
      {showScreen && (
        <div
          data-testid="boot-screen"
          aria-label="Starting up. Click or press Enter to skip."
          role="status"
          onClick={finish}
          className={`fixed inset-0 z-50 cursor-default transition-opacity duration-300 ${
            phase === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Screen />
        </div>
      )}
    </>
  );
}
