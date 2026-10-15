import type { ReactNode } from 'react';
import { OsSuggestBanner } from '@/components/site/os-suggest-banner';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { MAIN_CONTENT_ID, SkipLink } from '@/components/site/skip-link';
import { getProfile } from '@/lib/content';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <div aria-hidden data-site-chrome className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]" />
      <SkipLink />
      <SiteHeader name={profile.name} resumeHref="/resume" />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-5 outline-none">{children}</main>
      <SiteFooter profile={profile} />
      <OsSuggestBanner />
    </div>
  );
}
