import {
  BriefcaseBusiness,
  FileText,
  FolderOpen,
  Globe,
  Layers,
  type LucideIcon,
  Mail,
  SquareTerminal,
  UserRound,
} from 'lucide-react';
import type { AppIconName } from '@/os/core/types';

const GLYPHS: Record<AppIconName, LucideIcon> = {
  about: UserRound,
  projects: FolderOpen,
  experience: BriefcaseBusiness,
  skills: Layers,
  resume: FileText,
  contact: Mail,
  terminal: SquareTerminal,
  browser: Globe,
};

const SIZES = {
  xs: { box: 'size-4 rounded-[3px]', glyph: 11, stroke: 2.25 },
  sm: { box: 'size-[18px] rounded-[4px]', glyph: 12, stroke: 2.25 },
  md: { box: 'size-6 rounded-[5px]', glyph: 16, stroke: 2.25 },
  list: { box: 'size-8 rounded-[6px]', glyph: 20, stroke: 2 },
  lg: { box: 'size-11 rounded-[9px]', glyph: 27, stroke: 2 },
} as const;

/**
 * A soft, candy-coloured plate lit from the top-left with a white lucide glyph: the friendly,
 * rounded icon style of the era. Decorative: labels live on the buttons.
 */
export function AppTile({ app, size = 'md' }: { app: AppIconName; size?: keyof typeof SIZES }) {
  const Glyph = GLYPHS[app];
  const { box, glyph, stroke } = SIZES[size];
  return (
    <span aria-hidden className={`xp-tile relative inline-flex shrink-0 items-center justify-center text-white ${box}`} style={{ backgroundColor: `var(--xp-app-${app})` }}>
      <Glyph size={glyph} strokeWidth={stroke} className="relative drop-shadow-[1px_1px_0_rgb(0_0_0/0.3)]" />
    </span>
  );
}

/**
 * Original Start glyph: a sun rising over a green hill inside a white disc, echoing the wallpaper.
 * Deliberately not the four-pane window flag.
 */
export function HillGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={className}>
      <circle cx="10" cy="10" r="9" fill="var(--xp-glyph-rim)" />
      <circle cx="10" cy="10" r="7.6" fill="var(--xp-glyph-sky)" />
      <circle cx="12.6" cy="8" r="2.6" fill="var(--xp-glyph-sun)" />
      <path d="M2.6 12.4c2.6-2.6 5.6-3.2 8.4-1.4 2-1.2 4.4-1.2 6.4.2A7.6 7.6 0 0 1 2.6 12.4Z" fill="var(--xp-glyph-hill)" />
    </svg>
  );
}
