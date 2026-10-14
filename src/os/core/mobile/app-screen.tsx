'use client';

import { motion } from 'framer-motion';
import { type ComponentType, type ReactNode, useEffect, useRef } from 'react';

export type AppScreenProps = {
  id: string;
  title: string;
  Header: ComponentType<{ title: string; onBack(): void }>;
  onBack(): void;
  /** Layout id of the icon the app was opened from; null when another app opened it. */
  origin: string | null;
  reducedMotion: boolean;
  children: ReactNode;
};

const EASE = [0.32, 0.72, 0, 1] as const;

/** A full-screen app view: the skin's header, then the app body, clear of the status and nav bars. */
export function AppScreen({ id, title, Header, onBack, origin, reducedMotion, children }: AppScreenProps) {
  const ref = useRef<HTMLElement>(null);

  // Move focus into the app unless something inside it (e.g. an autoFocus input) already has it.
  useEffect(() => {
    const el = ref.current;
    if (el && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, []);

  const zoom = !reducedMotion && origin !== null;
  const motionProps = reducedMotion
    ? { initial: false as const }
    : zoom
      ? { layoutId: origin, transition: { duration: 0.42, ease: EASE } }
      : {
          initial: { opacity: 0, scale: 0.94 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.94 },
          transition: { duration: 0.28, ease: EASE },
        };

  return (
    <motion.section
      ref={ref}
      aria-label={title}
      tabIndex={-1}
      data-mobile="app"
      data-mobile-app={id}
      className="absolute inset-0 z-10 flex flex-col overflow-hidden outline-none"
      style={{
        paddingTop: 'var(--mobile-status-height, 44px)',
        paddingBottom: 'var(--mobile-nav-height, 34px)',
      }}
      {...motionProps}
    >
      <Header title={title} onBack={onBack} />
      <div data-mobile="app-body" className="min-h-0 flex-1">
        {children}
      </div>
    </motion.section>
  );
}
