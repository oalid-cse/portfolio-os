'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

type OverviewState = { open: boolean; setOpen(open: boolean | ((o: boolean) => boolean)): void };

const OverviewContext = createContext<OverviewState | null>(null);

/** Shares the Activities overview's open state between the top bar and the dock. */
export function OverviewProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <OverviewContext.Provider value={value}>{children}</OverviewContext.Provider>;
}

export function useOverview(): OverviewState {
  const ctx = useContext(OverviewContext);
  if (!ctx) throw new Error('useOverview must be used inside OverviewProvider');
  return ctx;
}

/** The overview's element id, for `aria-controls` on its toggles while it is open. */
export const OVERVIEW_ID = 'ubu-activities-overview';

/** Marks the buttons that toggle the overview, so the overview's outside-click check skips them. */
export const OVERVIEW_TOGGLE = 'data-overview-toggle';
