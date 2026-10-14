'use client';

import { useState } from 'react';
import type { AppProps } from './app-props';

export function ProjectsApp({ data }: AppProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const project = data.projects.find((p) => p.slug === slug);

  if (project) {
    const links = Object.entries(project.links ?? {}).filter(([, href]) => Boolean(href));
    return (
      <div className="os-app os-stack">
        <button type="button" className="os-btn-inline" style={{ alignSelf: 'flex-start' }} onClick={() => setSlug(null)}>
          ← All projects
        </button>
        <h1>{project.title}</h1>
        <p className="os-muted">
          {project.role} · {project.year}
        </p>
        <p>{project.summary}</p>
        {project.tech.length > 0 && (
          <ul className="os-row" aria-label="Tech">
            {project.tech.map((t) => (
              <li key={t} className="os-chip">
                {t}
              </li>
            ))}
          </ul>
        )}
        {project.metrics && project.metrics.length > 0 && (
          <ul className="os-stack" style={{ gap: '0.5rem' }} aria-label="Metrics">
            {project.metrics.map((m) => (
              <li key={m.label} className="os-card">
                <strong>{m.value}</strong> <span className="os-muted">{m.label}</span>
              </li>
            ))}
          </ul>
        )}
        <ul className="os-row" style={{ gap: '1rem' }}>
          {links.map(([name, href]) => (
            <li key={name}>
              <a href={href} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
            </li>
          ))}
          <li>
            <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
              Open full case study
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="os-app os-stack">
      <h1>Projects</h1>
      <ul className="os-stack" style={{ gap: '0.5rem' }}>
        {data.projects.map((p) => (
          <li key={p.slug}>
            <button type="button" className="os-card os-btn" onClick={() => setSlug(p.slug)}>
              <h2>{p.title}</h2>
              <span className="os-muted">{p.summary}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
