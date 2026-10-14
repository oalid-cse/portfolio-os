import { SectionHeading } from '@/components/ui/section-heading';
import type { Education } from '@/content/types';
import { formatDateRange } from '@/lib/format';

export function EducationSection({ items }: { items: Education[] }) {
  return (
    <section id="education" aria-labelledby="education-title" className="scroll-mt-20 py-12">
      <SectionHeading id="education-title">Education</SectionHeading>
      <ul className="divide-y divide-border rounded-lg border border-border bg-bg-elevated">
        {items.map((e) => (
          <li key={e.id} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <div>
              <h3 className="font-medium">{e.degree}</h3>
              <p className="text-sm text-fg-muted">
                {e.institution}, {e.location}
              </p>
              {e.grade && <p className="mt-1 font-mono text-xs text-fg-muted">{e.grade}</p>}
            </div>
            <p className="font-mono text-xs text-fg-muted sm:shrink-0">{formatDateRange(e.start, e.end)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
