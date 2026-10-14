import type { z } from 'zod';
import type {
  educationSchema,
  experienceSchema,
  postFrontmatterSchema,
  profileSchema,
  projectFrontmatterSchema,
  skillGroupSchema,
  socialIconSchema,
} from './schemas';

export type SocialIcon = z.infer<typeof socialIconSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type SkillGroup = z.infer<typeof skillGroupSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

// Everything an OS experience needs, plain JSON (no React nodes, no MDX).
export type PortfolioData = {
  profile: Profile;
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  projects: ProjectFrontmatter[];
  posts: PostFrontmatter[];
  features: { contactForm: boolean };
};
