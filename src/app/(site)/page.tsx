import { AboutSection } from '@/components/site/sections/about';
import { ContactSection } from '@/components/site/sections/contact-section';
import { EducationSection } from '@/components/site/sections/education';
import { ExperienceTimeline } from '@/components/site/sections/experience-timeline';
import { FeaturedProjects } from '@/components/site/sections/featured-projects';
import { Hero } from '@/components/site/sections/hero';
import { SkillsSection } from '@/components/site/sections/skills';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/site/json-ld';
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkillGroups,
} from '@/lib/content';
import { buildMetadata, personJsonLd, profilePageJsonLd, truncateDescription } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return buildMetadata({ description: truncateDescription(profile.summary), path: '/', type: 'profile' });
}

export default async function HomePage() {
  const [profile, skills, experience, education, projects] = await Promise.all([
    getProfile(),
    getSkillGroups(),
    getExperience(),
    getEducation(),
    getProjects({ featured: true }),
  ]);
  return (
    <>
      <JsonLd data={personJsonLd(profile)} />
      <JsonLd data={profilePageJsonLd(profile)} />
      <Hero profile={profile} />
      <AboutSection profile={profile} skillGroups={skills} />
      <SkillsSection groups={skills} />
      <ExperienceTimeline items={experience} />
      <FeaturedProjects projects={projects} />
      <EducationSection items={education} />
      <ContactSection profile={profile} />
    </>
  );
}
