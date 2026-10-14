import 'server-only';
import path from 'node:path';
import education from '@/content/education';
import experience from '@/content/experience';
import profile from '@/content/profile';
import skillGroups from '@/content/skills';
import type {
  Education,
  Experience,
  PortfolioData,
  PostFrontmatter,
  Profile,
  ProjectFrontmatter,
  SkillGroup,
} from '@/content/types';
import { createContentReader } from './content-reader';
import { isContactFormEnabled } from './features';

const reader = createContentReader(path.join(process.cwd(), 'src/content'), {
  includeDrafts: process.env.NODE_ENV !== 'production',
});

export async function getProfile(): Promise<Profile> {
  return profile;
}
export async function getSkillGroups(): Promise<SkillGroup[]> {
  return skillGroups;
}
export async function getExperience(): Promise<Experience[]> {
  return experience;
}
export async function getEducation(): Promise<Education[]> {
  return education;
}
export async function getProjects(opts?: { featured?: boolean }): Promise<ProjectFrontmatter[]> {
  return reader.getProjects(opts);
}
export async function getProject(slug: string): Promise<{ meta: ProjectFrontmatter; body: string } | null> {
  return reader.getProject(slug);
}
export async function getPosts(): Promise<PostFrontmatter[]> {
  return reader.getPosts();
}
export async function getPost(slug: string): Promise<{ meta: PostFrontmatter; body: string } | null> {
  return reader.getPost(slug);
}

// Frontmatter only (no MDX bodies) so the OS bundle stays plain JSON.
export async function getPortfolioData(): Promise<PortfolioData> {
  const [p, skills, exp, edu, projects, posts] = await Promise.all([
    getProfile(),
    getSkillGroups(),
    getExperience(),
    getEducation(),
    getProjects(),
    getPosts(),
  ]);
  return {
    profile: p,
    skills,
    experience: exp,
    education: edu,
    projects,
    posts,
    features: { contactForm: isContactFormEnabled() },
  };
}
