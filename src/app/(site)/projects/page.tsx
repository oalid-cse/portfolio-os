import type { Metadata } from 'next';
import { ProjectCard } from '@/components/site/project-card';
import { JsonLd } from '@/components/site/json-ld';
import { getProfile, getProjects } from '@/lib/content';
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const { name } = await getProfile();
  return buildMetadata({
    title: 'Projects',
    description: `Selected backend and full-stack projects by ${name}.`,
    path: '/projects',
  });
}

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }])} />
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
