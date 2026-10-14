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
 * A rounded-square app icon (gradient plate, top highlight, soft drop shadow) with a lucide glyph.
 * It fills its container, so the Dock can scale it freely. Decorative: labels live on the buttons.
 */
export function AppIcon({ app, className = 'size-full' }: { app: AppIconName; className?: string }) {
  const Glyph = GLYPHS[app];
  return (
    <span
      aria-hidden
      className={`mac-icon inline-flex shrink-0 items-center justify-center rounded-[23%] ${className}`}
      style={{ background: `var(--mac-icon-${app})`, color: `var(--mac-glyph-${app}, white)` }}
    >
      <Glyph className="size-[56%]" strokeWidth={1.75} />
    </span>
  );
}

/** Original system glyph: a rounded square holding two wave lines. Deliberately not a fruit. */
export function SystemGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="5.5" strokeWidth="1.8" />
      <path d="M6.5 10.5c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6.5 14.5c1.8-1.6 3.7-1.6 5.5 0s3.7 1.6 5.5 0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
