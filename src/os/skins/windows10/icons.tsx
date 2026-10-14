import {
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  Globe,
  Layers,
  type LucideIcon,
  Mail,
  SquareTerminal,
  UserRound,
} from 'lucide-react';
import type { AppIconName } from '@/os/core/types';

export const GLYPHS: Record<AppIconName, LucideIcon> = {
  about: UserRound,
  projects: FolderKanban,
  experience: BriefcaseBusiness,
  skills: Layers,
  resume: FileText,
  contact: Mail,
  terminal: SquareTerminal,
  browser: Globe,
};

const SIZES = {
  xs: { box: 'size-4', glyph: 11 },
  sm: { box: 'size-6', glyph: 15 },
  list: { box: 'size-8', glyph: 18 },
  lg: { box: 'size-11', glyph: 26 },
} as const;

/** The app's flat Metro-style colour, as a CSS value. */
export const appColor = (app: AppIconName) => `var(--w10-app-${app})`;

/** A flat, square colour plate with a white lucide glyph. Decorative: labels live on the buttons. */
export function AppSquare({ app, size = 'sm' }: { app: AppIconName; size?: keyof typeof SIZES }) {
  const Glyph = GLYPHS[app];
  const { box, glyph } = SIZES[size];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center text-white ${box}`}
      style={{ background: appColor(app) }}
    >
      <Glyph size={glyph} strokeWidth={1.75} />
    </span>
  );
}

/**
 * Original Start glyph: an outlined square with a solid square stepping out of its lower-right
 * corner, like a tile lifting off the screen. Deliberately not the four-pane window.
 */
export function StartGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3.5" y="3.5" width="12" height="12" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10" y="10" width="10.5" height="10.5" fill="currentColor" />
    </svg>
  );
}
