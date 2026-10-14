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
import { useId } from 'react';
import type { AppIconName } from '@/os/core/types';

const GLYPHS: Record<AppIconName, LucideIcon> = {
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
  sm: { box: 'size-4 rounded-[4px]', glyph: 11 },
  md: { box: 'size-6 rounded-[6px]', glyph: 15 },
  start: { box: 'size-8 rounded-[8px]', glyph: 19 },
  lg: { box: 'size-11 rounded-[10px]', glyph: 26 },
} as const;

/** A Fluent-style rounded colour tile with a white lucide glyph. Decorative: labels live on the buttons. */
export function AppTile({ app, size = 'md' }: { app: AppIconName; size?: keyof typeof SIZES }) {
  const Glyph = GLYPHS[app];
  const { box, glyph } = SIZES[size];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center text-white shadow-(--w11-tile-shadow) ${box}`}
      style={{ background: `var(--w11-tile-${app})` }}
    >
      <Glyph size={glyph} strokeWidth={size === 'lg' ? 1.75 : 2} />
    </span>
  );
}

/** Original Start glyph: a rounded, faceted diamond (deliberately not a four-pane window). */
export function StartGlyph({ className }: { className?: string }) {
  const gradient = useId();
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className}>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--w11-start-a)" />
          <stop offset="1" stopColor="var(--w11-start-b)" />
        </linearGradient>
      </defs>
      <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.6" transform="rotate(45 12 12)" fill={`url(#${gradient})`} />
      <rect x="8.6" y="8.6" width="6.8" height="6.8" rx="1.6" transform="rotate(45 12 12)" fill="white" fillOpacity={0.85} />
    </svg>
  );
}
