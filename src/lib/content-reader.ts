import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import type { z } from 'zod';
import { postFrontmatterSchema, projectFrontmatterSchema } from '@/content/schemas';
import type { PostFrontmatter, ProjectFrontmatter } from '@/content/types';

type ReaderOptions = { includeDrafts?: boolean };
type Entry<T> = { meta: T; body: string };

// gray-matter turns unquoted YAML dates into Date objects; schemas expect YYYY-MM-DD strings.
function normalizeDates(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(normalizeDates);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalizeDates(v)]));
  }
  return value;
}

async function readDir<S extends z.ZodType>(dir: string, schema: S): Promise<Entry<z.infer<S>>[]> {
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx')).sort();
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  return Promise.all(
    files.map(async (file) => {
      const parsed = matter(await fs.readFile(path.join(dir, file), 'utf8'));
      const result = schema.safeParse(normalizeDates(parsed.data));
      if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
        throw new Error(`Invalid frontmatter in ${file}: ${issues}`);
      }
      const meta = result.data as z.infer<S> & { slug: string };
      const stem = file.replace(/\.mdx$/, '');
      if (meta.slug !== stem) {
        throw new Error(`Invalid frontmatter in ${file}: slug "${meta.slug}" must match filename "${stem}"`);
      }
      return { meta, body: parsed.content.replace(/^\n+/, '') };
    }),
  );
}

export function createContentReader(rootDir: string, opts: ReaderOptions = {}) {
  const projectEntries = () => readDir(path.join(rootDir, 'projects'), projectFrontmatterSchema);
  const postEntries = async () => {
    const all = await readDir(path.join(rootDir, 'blog'), postFrontmatterSchema);
    return opts.includeDrafts ? all : all.filter((e) => !e.meta.draft);
  };

  return {
    async getProjects(o?: { featured?: boolean }): Promise<ProjectFrontmatter[]> {
      const list = (await projectEntries()).map((e) => e.meta);
      const filtered = o?.featured === undefined ? list : list.filter((p) => p.featured === o.featured);
      return filtered.sort((a, b) => a.order - b.order);
    },
    async getProject(slug: string): Promise<Entry<ProjectFrontmatter> | null> {
      return (await projectEntries()).find((e) => e.meta.slug === slug) ?? null;
    },
    async getPosts(): Promise<PostFrontmatter[]> {
      return (await postEntries()).map((e) => e.meta).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    },
    async getPost(slug: string): Promise<Entry<PostFrontmatter> | null> {
      return (await postEntries()).find((e) => e.meta.slug === slug) ?? null;
    },
  };
}
