'use client';

import { createContext, type ReactNode, use } from 'react';

/**
 * True where the skin's own screen chrome already renders the screen's h1 (mobile large titles).
 * An app's top heading then becomes an h2, so every screen keeps exactly one h1.
 */
export const ScreenTitleContext = createContext(false);

/** An app's top heading that is not just its name (e.g. the owner's name in About, "Blog"). */
export function AppHeading({ children }: { children: ReactNode }) {
  const Tag = use(ScreenTitleContext) ? 'h2' : 'h1';
  return <Tag>{children}</Tag>;
}
