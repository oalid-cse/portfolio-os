import Image from 'next/image';
import type { ProjectFrontmatter } from '@/content/types';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';

const linkLabels = [
  ['live', 'Live site'],
  ['source', 'Source code'],
  ['marketplace', 'Marketplace'],
] as const;

export function ProjectHeader({ meta }: { meta: ProjectFrontmatter }) {
  const { title, summary, role, year, tech, links, metrics, screenshots } = meta;
  const buttons = linkLabels.filter(([key]) => links?.[key]);
  return (
    <header className="space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-sm text-fg-muted">
          {role} · {year}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{summary}</p>
      </div>
      <ul className="flex flex-wrap gap-1.5" aria-label="Technologies">
        {tech.map((t) => (
          <li key={t}>
            <Badge>{t}</Badge>
          </li>
        ))}
      </ul>
      {buttons.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {buttons.map(([key, label], i) => (
            <ButtonLink key={key} href={links?.[key] ?? ''} variant={i === 0 ? 'primary' : 'secondary'}>
              {label}
            </ButtonLink>
          ))}
        </div>
      )}
      {metrics && metrics.length > 0 && (
        <section aria-labelledby="project-metrics">
          <h2 id="project-metrics" className="sr-only">
            Metrics
          </h2>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-bg-elevated p-4">
                <dt className="text-xs text-fg-muted">{m.label}</dt>
                <dd className="font-mono text-xl text-fg">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {screenshots && screenshots.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {screenshots.map((src) => (
            <li key={src} className="overflow-hidden rounded-lg border border-border">
              <Image src={src} alt={`${title} screenshot`} width={1200} height={750} className="h-auto w-full" />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
