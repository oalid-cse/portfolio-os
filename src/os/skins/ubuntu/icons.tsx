import {
  BriefcaseBusiness,
  Compass,
  FileText,
  FolderKanban,
  Layers,
  type LucideIcon,
  Mail,
  SquareTerminal,
  UserRound,
} from 'lucide-react';
import type { AppIconName } from '@/os/core/types';

const GLYPHS: Record<AppIconName, LucideIcon> = {
  about: UserRound,
  projects: FolderKanban,
  experience: BriefcaseBusiness,
  skills: Layers,
  resume: FileText,
  contact: Mail,
  terminal: SquareTerminal,
  browser: Compass,
};

/**
 * A Yaru-flavoured app icon: a softly rounded plate with a lucide glyph. Fills its container.
 * Decorative: labels live on the buttons that hold it.
 */
export function AppIcon({ app, className = 'size-full' }: { app: AppIconName; className?: string }) {
  const Glyph = GLYPHS[app];
  return (
    <span
      aria-hidden
      className={`ubu-icon inline-flex shrink-0 items-center justify-center rounded-[26%] ${className}`}
      style={{ background: `var(--ubu-icon-${app})`, color: `var(--ubu-glyph-${app}, white)` }}
    >
      <Glyph className="size-[56%]" strokeWidth={1.9} />
    </span>
  );
}

/** "Show apps": a 3x3 dot grid, drawn rather than borrowed. */
export function ShowAppsGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      {[4, 12, 20].flatMap((cy) => [4, 12, 20].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.3" />))}
    </svg>
  );
}
