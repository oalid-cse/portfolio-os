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
  xs: { box: 'size-4 rounded-[3px]', glyph: 11 },
  sm: { box: 'size-7 rounded-md', glyph: 17 },
  list: { box: 'size-8 rounded-md', glyph: 19 },
  lg: { box: 'size-12 rounded-[10px]', glyph: 28 },
} as const;

/** The app's base colour, as a CSS value (used for the plate and for the superbar hover glow). */
export const appColor = (app: AppIconName) => `var(--w7-app-${app})`;

/**
 * A glossy, bevelled colour plate with a white lucide glyph: a lit top half, a darker base and a
 * soft inner rim, in the spirit of the era's shiny icons. Decorative: labels live on the buttons.
 */
export function AppGem({ app, size = 'sm' }: { app: AppIconName; size?: keyof typeof SIZES }) {
  const Glyph = GLYPHS[app];
  const { box, glyph } = SIZES[size];
  return (
    <span aria-hidden className={`w7-gem relative inline-flex shrink-0 items-center justify-center text-white ${box}`} style={{ backgroundColor: appColor(app) }}>
      <Glyph size={glyph} strokeWidth={2} className="relative drop-shadow-[0_1px_1px_rgb(0_0_0/0.45)]" />
    </span>
  );
}

/**
 * Original Start glyph: a four-pointed spark with a small companion spark, like light catching
 * glass. Deliberately not the four-pane window flag.
 */
export function SparkGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11 2.5c.5 4.6 2.4 6.5 7 7-4.6.5-6.5 2.4-7 7-.5-4.6-2.4-6.5-7-7 4.6-.5 6.5-2.4 7-7Z" />
      <path d="M18.5 14.5c.25 2.1 1.15 3 3.25 3.25-2.1.25-3 1.15-3.25 3.25-.25-2.1-1.15-3-3.25-3.25 2.1-.25 3-1.15 3.25-3.25Z" opacity="0.8" />
    </svg>
  );
}

/** The round Start orb: a glass sphere with a gloss cap, a cyan under-glow and the spark inside. */
export function StartOrb({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`w7-orb relative flex items-center justify-center rounded-full ${className ?? ''}`}>
      <SparkGlyph className="relative z-10 size-[55%] text-white drop-shadow-[0_0_3px_rgb(190_235_255/0.9)]" />
    </span>
  );
}
