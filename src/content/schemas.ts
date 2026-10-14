import { z } from 'zod';

const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'expected YYYY-MM');
const yearOrYearMonth = z.string().regex(/^\d{4}(-\d{2})?$/, 'expected YYYY or YYYY-MM');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const socialIconSchema = z.enum(['github', 'linkedin', 'email', 'whatsapp']);

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  summary: z.string().min(1),
  location: z.string().min(1),
  yearsOfExperience: z.number().int().nonnegative(),
  availability: z.enum(['open', 'freelance', 'not-looking']),
  email: z.email(),
  phone: z.string().optional(),
  avatar: z.string().min(1),
  resumePdf: z.string().min(1),
  socials: z.array(z.object({ label: z.string().min(1), url: z.string().min(1), icon: socialIconSchema })),
});

export const skillGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  skills: z.array(z.string().min(1)).min(1),
});

export const experienceSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  start: yearMonth,
  end: z.union([yearMonth, z.literal('present')]),
  highlights: z.array(z.string().min(1)).min(1),
  tech: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  degree: z.string().min(1),
  location: z.string().min(1),
  start: yearOrYearMonth.optional(),
  end: yearOrYearMonth,
  grade: z.string().optional(),
});

export const projectFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  tech: z.array(z.string()),
  role: z.string().min(1),
  year: z.number().int(),
  featured: z.boolean(),
  order: z.number(),
  links: z
    .object({ live: z.string().optional(), source: z.string().optional(), marketplace: z.string().optional() })
    .optional(),
  cover: z.string().optional(),
  screenshots: z.array(z.string()).optional(),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

export const postFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  publishedAt: isoDate,
  updatedAt: isoDate.optional(),
  tags: z.array(z.string()),
  draft: z.boolean().optional(),
});
