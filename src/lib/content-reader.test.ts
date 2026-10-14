import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createContentReader } from './content-reader';

const dir = path.join(__dirname, '__fixtures__/content');
const invalidDir = path.join(dir, 'invalid');
const mismatchDir = path.join(dir, 'mismatch');
const unquotedDir = path.join(dir, 'unquoted');
const r = createContentReader(dir);

describe('content reader', () => {
  it('sorts projects by order', async () => expect((await r.getProjects()).map((p) => p.slug)).toEqual(['b', 'a']));
  it('filters featured', async () => expect(await r.getProjects({ featured: true })).toHaveLength(1));
  it('returns null for unknown slug', async () => expect(await r.getProject('nope')).toBeNull());
  it('returns raw MDX body without frontmatter', async () => {
    const p = await r.getProject('a');
    expect(p!.meta.title).toBe('Project A');
    expect(p!.body).toContain('# Hello A');
    expect(p!.body).not.toContain('---');
  });
  it('excludes drafts unless includeDrafts', async () => {
    expect(await createContentReader(dir).getPosts()).toHaveLength(2);
    expect(await createContentReader(dir, { includeDrafts: true }).getPosts()).toHaveLength(3);
  });
  it('does not return a draft by slug unless includeDrafts', async () => {
    expect(await createContentReader(dir).getPost('wip')).toBeNull();
    expect(await createContentReader(dir, { includeDrafts: true }).getPost('wip')).not.toBeNull();
  });
  it('sorts posts newest first', async () =>
    expect((await r.getPosts()).map((p) => p.slug)).toEqual(['new', 'old']));
  it('throws with the filename on invalid frontmatter', async () =>
    await expect(createContentReader(invalidDir).getProjects()).rejects.toThrow(/broken\.mdx/));
  it('throws when frontmatter slug mismatches the filename', async () =>
    await expect(createContentReader(mismatchDir).getProjects()).rejects.toThrow(/actual\.mdx.*slug/));
  it('returns [] for a missing directory', async () => {
    const empty = createContentReader(path.join(dir, 'nonexistent'));
    expect(await empty.getProjects()).toEqual([]);
    expect(await empty.getPosts()).toEqual([]);
  });
  it('accepts unquoted YAML dates', async () => {
    const post = (await createContentReader(unquotedDir).getPosts())[0]!;
    expect(post.publishedAt).toBe('2025-02-03');
    expect(post.updatedAt).toBe('2025-02-04');
  });
});
