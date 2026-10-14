import type { Metadata } from 'next';
import { ProjectCard } from '@/components/site/project-card';
import { getProjects } from '@/lib/content';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">Selected backend and full-stack work.</p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug} className="flex">
            <div className="flex-1">
              <ProjectCard project={p} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
