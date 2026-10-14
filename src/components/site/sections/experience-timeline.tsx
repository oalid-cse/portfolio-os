import { Badge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-heading';
import type { Experience } from '@/content/types';
import { formatDateRange, formatDuration } from '@/lib/format';

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-20 py-12">
      <SectionHeading id="experience-title">Experience</SectionHeading>
      <ol className="relative ml-1.5 space-y-10 border-l border-border">
        {items.map((job) => (
          <li key={job.id} className="relative pl-6 sm:pl-8">
            <span
              aria-hidden
              className="absolute top-1.5 -left-[5px] size-2.5 rounded-full border-2 border-accent bg-bg"
            />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <h3 className="text-lg font-semibold tracking-tight">
                {job.role} <span className="font-normal text-fg-muted">at {job.company}</span>
              </h3>
              <p className="font-mono text-xs text-fg-muted sm:shrink-0">
                {formatDateRange(job.start, job.end)} · {formatDuration(job.start, job.end)}
              </p>
            </div>
            <p className="mt-1 text-sm text-fg-muted">{job.location}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-fg-muted marker:text-border">
              {job.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            {job.tech && job.tech.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                {job.tech.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
