import { describe, expect, it } from 'vitest';
import {
  educationSchema,
  experienceSchema,
  postFrontmatterSchema,
  profileSchema,
  projectFrontmatterSchema,
  skillGroupSchema,
} from './schemas';
import profile from './profile';
import skillGroups from './skills';
import experience from './experience';
import education from './education';

describe('content schemas', () => {
  it('accepts the real profile data', () => expect(() => profileSchema.parse(profile)).not.toThrow());
  it('accepts skills and education data', () => {
    skillGroups.forEach((g) => expect(() => skillGroupSchema.parse(g)).not.toThrow());
    education.forEach((e) => expect(() => educationSchema.parse(e)).not.toThrow());
  });
  it('keeps every AI-Assisted Development bullet from the CV', () =>
    expect(skillGroups.find((g) => g.id === 'ai')?.skills).toContain(
      'Accelerated development workflows and reduced delivery time',
    ));
  it('rejects experience with malformed date', () =>
    expect(() => experienceSchema.parse({ ...experience[0], start: 'March 2025' })).toThrow());
  it('accepts end: "present"', () =>
    expect(experienceSchema.parse({ ...experience[0], end: 'present' }).end).toBe('present'));
  it('has 3 experience entries newest first in source', () =>
    expect(experience.map((e) => e.id)).toEqual(['6amtech', 'retinasoft', 'igl-web']));
  it('allows education end as YYYY or YYYY-MM', () => {
    expect(() => educationSchema.parse({ ...education[1], end: '2013' })).not.toThrow();
    expect(() => educationSchema.parse({ ...education[0], end: '2017-06' })).not.toThrow();
    expect(() => educationSchema.parse({ ...education[0], end: 'June 2017' })).toThrow();
  });
  it('validates project and post frontmatter', () => {
    expect(() =>
      projectFrontmatterSchema.parse({
        slug: 'x', title: 'X', summary: 's', tech: ['Laravel'], role: 'r', year: 2024, featured: true, order: 1,
      }),
    ).not.toThrow();
    expect(() =>
      postFrontmatterSchema.parse({ slug: 'x', title: 'X', summary: 's', publishedAt: 'nope', tags: [] }),
    ).toThrow();
  });
});
