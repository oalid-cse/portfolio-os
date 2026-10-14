import type { ReactNode } from 'react';
import { OsSuggestBanner } from '@/components/site/os-suggest-banner';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getProfile } from '@/lib/content';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px]" />
      <SiteHeader name={profile.name} resumeHref="/resume" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5">{children}</main>
      <SiteFooter profile={profile} />
      <OsSuggestBanner />
    </div>
  );
}
