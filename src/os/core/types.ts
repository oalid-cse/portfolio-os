import type { PortfolioData } from '@/content/types';

export type OsId = 'windows11' | 'macos' | 'iphone' | 'windows10' | 'windows7' | 'windowsxp' | 'ubuntu';
export type ComingSoonId = 'samsung';
export type OsKind = 'desktop' | 'mobile';

export type AppId =
  | 'about'
  | 'projects'
  | 'experience'
  | 'skills'
  | 'resume'
  | 'contact'
  | 'terminal'
  | 'browser';

export type OsRootProps = { data: PortfolioData };

export type OsSkinMeta = {
  id: OsId | ComingSoonId;
  name: string;
  kind: OsKind;
  status: 'ready' | 'coming-soon';
  /** Absent until images exist; the gallery renders a styled placeholder tile. */
  thumbnail?: string;
};

export type AppIconName = AppId;
