import {
  BriefcaseBusiness,
  Compass,
  FileText,
  FolderKanban,
  Layers,
  type LucideIcon,
  Mail,
  Settings,
  SquareTerminal,
  UserRound,
} from 'lucide-react';
import type { AppIconName } from '@/os/core/types';

type IconName = AppIconName | 'switch-os';

const GLYPHS: Record<IconName, LucideIcon> = {
  about: UserRound,
  projects: FolderKanban,
  experience: BriefcaseBusiness,
  skills: Layers,
  resume: FileText,
  contact: Mail,
  terminal: SquareTerminal,
  browser: Compass,
  'switch-os': Settings,
};

/** A rounded-square home-screen icon: gradient plate, lucide glyph. Decorative; the button carries the label. */
export function AppIcon({ app }: { app: IconName }) {
  const Glyph = GLYPHS[app];
  return (
    <span
      aria-hidden
      className="ios-icon flex size-full items-center justify-center"
      style={{ background: `var(--ios-icon-${app})`, color: `var(--ios-glyph-${app}, white)` }}
    >
      <Glyph className="size-[54%]" strokeWidth={1.9} />
    </span>
  );
}
