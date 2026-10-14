import { SectionHeading } from '@/components/ui/section-heading';
import type { Profile, SkillGroup } from '@/content/types';

export function AboutSection({ profile, skillGroups }: { profile: Profile; skillGroups: SkillGroup[] }) {
  const focus = skillGroups
    .filter((g) => g.id !== 'ai')
    .slice(0, 3)
    .map((g) => g.label)
    .join(', ');
  const facts = [
    { label: 'Location', value: profile.location },
    { label: 'Experience', value: `${profile.yearsOfExperience}+ years` },
    { label: 'Focus', value: focus },
  ];
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-12">
      <SectionHeading id="about-title">About</SectionHeading>
      <div className="grid gap-8 md:grid-cols-[3fr_2fr]">
        <p className="max-w-prose leading-relaxed text-fg-muted">{profile.summary}</p>
        <dl className="space-y-3 rounded-lg border border-border bg-bg-elevated p-5 text-sm">
          {facts.map((f) => (
            <div key={f.label} className="flex justify-between gap-4">
              <dt className="text-fg-muted">{f.label}</dt>
              <dd className="text-right font-mono">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
