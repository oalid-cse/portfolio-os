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

/** A One UI-style squircle: flat colour plate, white lucide glyph. Decorative; the button carries the label. */
export function AppIcon({ app }: { app: IconName }) {
  const Glyph = GLYPHS[app];
  return (
    <span
      aria-hidden
      className="oneui-icon flex size-full items-center justify-center"
      style={{ background: `var(--oneui-icon-${app})`, color: `var(--oneui-glyph-${app}, white)` }}
    >
      <Glyph className="size-[50%]" strokeWidth={2} />
    </span>
  );
}
