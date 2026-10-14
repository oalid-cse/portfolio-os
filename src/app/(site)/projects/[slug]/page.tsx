import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { renderMdx } from '@/components/mdx/render-mdx';
import { ProjectHeader } from '@/components/site/project-header';
import { getProject, getProjects } from '@/lib/content';

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  return project ? { title: project.meta.title } : {};
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const body = await renderMdx(project.body);
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/projects" className="mb-8 inline-block text-sm text-fg-muted hover:text-fg">
        ← All projects
      </Link>
      <ProjectHeader meta={project.meta} />
      <div className="mt-10">{body}</div>
    </article>
  );
}
