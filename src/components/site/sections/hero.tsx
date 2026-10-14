import Image from 'next/image';
import { ButtonLink } from '@/components/ui/button';
import type { Profile } from '@/content/types';

const availabilityCopy: Partial<Record<Profile['availability'], string>> = {
  open: 'Open to opportunities',
  freelance: 'Available for freelance',
};

export function Hero({ profile }: { profile: Profile }) {
  const pill = availabilityCopy[profile.availability];
  return (
    <section aria-label="Introduction" className="grid items-center gap-10 py-16 md:grid-cols-[1fr_auto] md:py-24">
      <div className="space-y-6">
        {pill && (
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated px-3 py-1 text-sm text-fg-muted">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {pill}
          </p>
        )}
        <div className="space-y-3">
          <p className="font-mono text-sm text-accent">
            {profile.title} · {profile.yearsOfExperience}+ years
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{profile.name}</h1>
        </div>
        <p className="max-w-xl text-lg leading-relaxed text-fg-muted">{profile.tagline}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/projects">View projects</ButtonLink>
          <ButtonLink href={profile.resumePdf} variant="secondary" download>
            Download CV
          </ButtonLink>
          <ButtonLink href="/#contact" variant="ghost">
            Contact
          </ButtonLink>
        </div>
      </div>
      <div className="relative mx-auto w-44 md:w-64">
        <div aria-hidden className="absolute -inset-3 rounded-2xl border border-border" />
        <div aria-hidden className="absolute -right-3 -bottom-3 size-full rounded-2xl bg-accent/15" />
        <Image
          src={profile.avatar}
          alt={`Portrait of ${profile.name}`}
          width={1000}
          height={1000}
          priority
          sizes="(min-width: 768px) 256px, 176px"
          className="relative aspect-square w-full rounded-2xl object-cover"
        />
      </div>
    </section>
  );
}
