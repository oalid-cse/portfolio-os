import Link from 'next/link';
import { ProjectCard } from '@/components/site/project-card';
import { SectionHeading } from '@/components/ui/section-heading';
import type { ProjectFrontmatter } from '@/content/types';

export function FeaturedProjects({ projects }: { projects: ProjectFrontmatter[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-20 py-12">
      <SectionHeading id="projects-title">Featured projects</SectionHeading>
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
      <p className="mt-6 text-sm">
        <Link href="/projects" className="text-accent underline-offset-4 hover:underline">
          See all projects
        </Link>
      </p>
    </section>
  );
}
