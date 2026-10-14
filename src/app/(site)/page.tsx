import { AboutSection } from '@/components/site/sections/about';
import { ContactSection } from '@/components/site/sections/contact-section';
import { EducationSection } from '@/components/site/sections/education';
import { ExperienceTimeline } from '@/components/site/sections/experience-timeline';
import { FeaturedProjects } from '@/components/site/sections/featured-projects';
import { Hero } from '@/components/site/sections/hero';
import { SkillsSection } from '@/components/site/sections/skills';
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkillGroups,
} from '@/lib/content';

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
