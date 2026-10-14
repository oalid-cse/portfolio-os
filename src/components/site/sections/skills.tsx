import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import type { SkillGroup } from '@/content/types';

export function SkillsSection({ groups }: { groups: SkillGroup[] }) {
  const main = groups.filter((g) => g.id !== 'ai');
  const ai = groups.find((g) => g.id === 'ai');
  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-20 py-12">
      <SectionHeading id="skills-title">Skills</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {main.map((g) => (
          <div key={g.id} className="space-y-3">
            <h3 className="text-sm font-medium">{g.label}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {g.skills.map((s) => (
                <li key={s}>
                  <Badge>{s}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {ai && (
        <div className="mt-10 rounded-lg border border-dashed border-border bg-bg-elevated p-5">
          <h3 className="mb-3 text-sm font-medium">{ai.label}</h3>
          <ul className="grid gap-2 text-sm text-fg-muted sm:grid-cols-2">
            {ai.skills.map((s) => (
              <li key={s} className="flex gap-2">
                <span aria-hidden className="font-mono text-accent">
                  &gt;
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
