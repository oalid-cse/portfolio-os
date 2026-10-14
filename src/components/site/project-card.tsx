import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ProjectFrontmatter } from '@/content/types';
import { Badge } from '@/components/ui/badge';

export function ProjectCard({ project }: { project: ProjectFrontmatter }) {
  const { slug, title, summary, tech, role, year, metrics } = project;
  return (
    <article className="group relative flex flex-col gap-4 rounded-lg border border-border bg-bg-elevated p-5 transition-colors hover:border-accent">
      <header className="space-y-1">
        <p className="font-mono text-xs text-fg-muted">
          {role} · {year}
        </p>
        <h3 className="flex items-center justify-between gap-2 text-lg font-semibold tracking-tight">
          <Link
            href={`/projects/${slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
          >
            {title}
          </Link>
          <ArrowUpRight
            className="size-4 shrink-0 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            aria-hidden
          />
        </h3>
      </header>
      <p className="text-sm leading-relaxed text-fg-muted">{summary}</p>
      {metrics && metrics.length > 0 && (
        <dl className="flex flex-wrap gap-x-6 gap-y-2">
          {metrics.map((m) => (
            <div key={m.label}>
              <dt className="text-xs text-fg-muted">{m.label}</dt>
              <dd className="font-mono text-sm text-fg">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <ul className="mt-auto flex flex-wrap gap-1.5" aria-label="Technologies">
        {tech.map((t) => (
          <li key={t}>
            <Badge>{t}</Badge>
          </li>
        ))}
      </ul>
    </article>
  );
}
