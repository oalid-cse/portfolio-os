'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // false on the server and during hydration, true afterwards: no mismatch.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const btn =
    'inline-flex size-9 items-center justify-center rounded-md border border-border text-fg-muted transition-colors hover:text-fg';

  if (!mounted) {
    return <span aria-hidden className={btn} />;
  }
  const isDark = resolvedTheme !== 'light';
  return (
    <button
      type="button"
      className={btn}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
