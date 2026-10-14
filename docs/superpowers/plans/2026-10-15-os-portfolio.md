# OS Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Abu Bin Oalid's portfolio: a fast, SEO-optimized classic site (dark + light themes), plus opt-in OS experiences (Windows 11, macOS, iPhone) that show the same content and are suggested based on the visitor's detected OS.

**Architecture:** Next.js App Router. All content lives in `src/content/` and is read only through the async content layer `src/lib/content.ts`. The classic site (`src/app/(site)`) is statically rendered and is the only indexed surface. OS experiences live under `/os/[os]` (noindex). Each one is a lazy-loaded skin built on a shared desktop engine (window manager) or mobile engine (app stack), and all skins render the same shared app bodies.

**Tech Stack:** Next.js (latest stable, ≥16) · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · next-mdx-remote (RSC) · gray-matter · zod · Zustand · next-themes · Resend · Vitest + React Testing Library + jsdom · Playwright (+ @axe-core/playwright) · Lighthouse CI · pnpm · Vercel

**Spec:** `docs/superpowers/specs/2026-10-15-os-portfolio-design.md`. Read it alongside this plan. Project rules are in `AGENTS.md`.

## Global Constraints

- Node 24, pnpm. Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `check` (= lint + typecheck + test).
- TypeScript `strict: true`; no `any`.
- Content is read **only** via `src/lib/content.ts`. All content functions return `Promise<…>`.
- `src/components/site/**` ↛ `src/os/**` and vice versa (except `OsSuggestBanner` → `os-detect.ts` + registry metadata). Skins never import other skins.
- OS ids (v1): `'windows11' | 'macos' | 'iphone'`.
- Default theme: **dark**. Second theme: `light` ("minimal"). Attribute: `data-theme`.
- Title template: `%s · Abu Bin Oalid`. Default title: `Abu Bin Oalid · Senior Backend Engineer`.
- `/os/*`: `robots: { index: false, follow: true }`, disallowed in `robots.ts`, absent from `sitemap.ts`.
- OS detection only in `useEffect`; server HTML identical for all visitors.
- Banner copy: `You're on {OS name}. View this portfolio as {OS name}?` with buttons `Open` and `Not now`.
- Banner dismissal key: `localStorage['os-suggest-dismissed'] = '1'`. Every storage access is wrapped in try/catch.
- Footer link text: `Explore OS versions` → `/os`.
- `/os` disclaimer copy: `Fan-made recreations for a personal portfolio. Not affiliated with Microsoft, Apple, Samsung, or Canonical.`
- Desktop skins below 768px viewport width show the small-screen notice.
- Boot screen ≤ 1.5s, skippable, skipped with `prefers-reduced-motion` or if `sessionStorage['os-booted-<id>']` is set.
- Budgets: Lighthouse ≥ 95 in all four categories on `/` and `/projects/alhisab`. `/` first-load JS ≤ 120 kB gzip.
- No official OS logos, wallpapers, or proprietary fonts. Sources go in `public/os/<id>/CREDITS.md`.
- Never invent portfolio facts. Unknown values use `TODO(owner): …` placeholders.
- Unit/component tests are colocated as `*.test.ts(x)`. E2E tests go in `tests/e2e/*.spec.ts`.

## Review Focus

1. **Storage unavailable** (Safari private mode, blocked cookies): `localStorage` throws. Expected: the banner still shows and can be dismissed for the session, the theme falls back to dark, and nothing crashes. Test: Task 15.
2. **Garbage or missing user agent** (bots, empty UA, no `userAgentData`). Expected: `detectOs` returns `'unknown'`, no banner, no throw. Test: Task 13.
3. **Window dragged off-screen or viewport shrunk**. Expected: the title bar always stays reachable (clamped). Test: Task 19.
4. **Sparse project** (no links, screenshots, or metrics). Expected: the case-study page renders with no empty headings or broken images. Test: Task 7.
5. **Terminal input noise** (empty line, extra spaces, uppercase, unknown command). Expected: whitespace and case are normalized, and an unknown command prints `command not found: <cmd>. Type 'help'.`. Test: Task 18.

---

# Phase 1: Foundation

### Task 1: Scaffold project, tooling, and CI

**Files:**
- Create: Next.js app via `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack` (accept defaults otherwise)
- Create: `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`, `.env.example`, `.github/workflows/ci.yml`, `src/lib/utils.ts`, `src/lib/utils.test.ts`
- Modify: `package.json` (scripts), `tsconfig.json` (strict already on; add `"noUncheckedIndexedAccess": true`), `.gitignore` (add `.env*.local`, `/test-results`, `/playwright-report`, `.lighthouseci`)
- Move: `Abu Bin Oalid.pdf` → `public/resume/abu-bin-oalid.pdf`; `profile_linkedin_facebook_1000x1000.jpg` → `public/images/profile.jpg`

**Interfaces:**
- Produces: `cn(...classes: ClassValue[]): string` (clsx + tailwind-merge) in `src/lib/utils.ts`

- [ ] **Step 1:** (Repo already initialized.) Scaffold into the existing folder; keep `docs/`, `AGENTS.md`, `CLAUDE.md`, `.github/`. Move the PDF and photo as listed.
- [ ] **Step 2:** Add dev deps: `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test @axe-core/playwright vite-tsconfig-paths`. Add deps: `clsx tailwind-merge zod`. Run `pnpm exec playwright install --with-deps chromium webkit`.
- [ ] **Step 3: Write the failing test** `src/lib/utils.test.ts`:

```ts
it('merges conflicting tailwind classes, last wins', () => {
  expect(cn('px-2', false && 'hidden', 'px-4')).toBe('px-4');
});
```

- [ ] **Step 4:** Run `pnpm test`. Expected: FAIL (`cn` not exported).
- [ ] **Step 5:** Implement `cn`. Configure Vitest (jsdom env, setup file imports `@testing-library/jest-dom/vitest`, tsconfig paths, exclude `tests/e2e`). Configure Playwright: `webServer: { command: 'pnpm build && pnpm start', port: 3000 }`, projects `chromium` (1440×900) and `mobile-safari` (iPhone 15 device).
- [ ] **Step 6:** Add scripts: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:e2e": "playwright test"`, `"check": "pnpm lint && pnpm typecheck && pnpm test"`.
- [ ] **Step 7:** CI workflow (`push` + `pull_request`): pnpm setup, Node 24, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, Playwright install + `pnpm test:e2e`.
- [ ] **Step 8:** `.env.example` with `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and `RESEND_API_KEY=` and `CONTACT_TO_EMAIL=`.
- [ ] **Step 9:** Run `pnpm check && pnpm build`. Expected: all green.
- [ ] **Step 10: Commit:** `chore: scaffold Next.js app with testing and CI`

### Task 2: Content types, schemas, and CV data

**Files:**
- Create: `src/content/types.ts`, `src/content/schemas.ts`, `src/content/profile.ts`, `src/content/skills.ts`, `src/content/experience.ts`, `src/content/education.ts`, `src/content/schemas.test.ts`

**Interfaces:**
- Produces: types `Profile`, `SocialIcon` (`'github' | 'linkedin' | 'email' | 'whatsapp'`), `SkillGroup`, `Experience`, `Education`, `ProjectFrontmatter`, `PostFrontmatter`, `PortfolioData` (exactly as spec §3). zod schemas `profileSchema`, `skillGroupSchema`, `experienceSchema`, `educationSchema`, `projectFrontmatterSchema`, `postFrontmatterSchema`. Types are `z.infer` of the schemas.
- Produces: default exports `profile`, `skillGroups`, `experience`, `education` (validated with `.parse` at module load).

- [ ] **Step 1: Write failing tests** `schemas.test.ts`:

```ts
it('accepts the real profile data', () => expect(() => profileSchema.parse(profile)).not.toThrow());
it('rejects experience with malformed date', () =>
  expect(() => experienceSchema.parse({ ...experience[0], start: 'March 2025' })).toThrow());
it('accepts end: "present"', () =>
  expect(experienceSchema.parse({ ...experience[0], end: 'present' }).end).toBe('present'));
it('has 3 experience entries newest first in source', () =>
  expect(experience.map(e => e.id)).toEqual(['6amtech', 'retinasoft', 'igl-web']));
```

- [ ] **Step 2:** Run `pnpm test src/content`. Expected: FAIL.
- [ ] **Step 3:** Implement the schemas (dates `/^\d{4}-\d{2}$/`) and the data **verbatim from the CV**:
  - profile: name `Abu Bin Oalid`, title `Senior Backend Engineer`, yearsOfExperience `7`, location `Dhaka, Bangladesh`, email `oalid.mmj@gmail.com`, phone `+8801719134842`, summary = CV Career Objective, socials: LinkedIn `https://linkedin.com/in/abu-bin-oalid`, GitHub `https://github.com/oalid-cse`, WhatsApp `https://wa.me/8801719134842`. `availability: 'open'` with comment `// TODO(owner): confirm`. tagline: `I design scalable, multi-tenant backend systems with PHP & Laravel.` with comment `// TODO(owner): confirm wording`.
  - skills: groups `backend`, `frontend`, `database`, `devops`, `realtime`, `architecture`, `ai` with the CV items.
  - experience: 6amTech `2025-03`→`2026-03`; RetinaSoft `2020-10`→`2025-02`; IGL Web Ltd `2018-07`→`2020-07`, highlights from the CV.
  - education: Barguna Polytechnic Institute (Diploma in Computer Technology, `2013-07`→`2017-06`, CGPA 3.41 / 4.00); Mahimagonj High School, Gobindogonj (SSC, end `2013`, GPA 4.44 / 5.00). Allow `end` to be `YYYY` or `YYYY-MM`.
- [ ] **Step 4:** Run `pnpm test src/content`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(content): add typed content model and CV data`

### Task 3: Content layer

**Files:**
- Create: `src/lib/content-reader.ts`, `src/lib/content.ts`, `src/lib/content-reader.test.ts`, `src/lib/__fixtures__/content/projects/*.mdx`, `src/lib/__fixtures__/content/blog/*.mdx`
- Add dep: `gray-matter`

**Interfaces:**
- Consumes: schemas and data from Task 2.
- Produces (`content-reader.ts`): `createContentReader(rootDir: string, opts?: { includeDrafts?: boolean })` returning `{ getProjects, getProject, getPosts, getPost }`, which read `<rootDir>/projects/*.mdx` and `<rootDir>/blog/*.mdx`.
- Produces (`content.ts`, the public API used by the whole app): `getProfile()`, `getSkillGroups()`, `getExperience()`, `getEducation()`, `getProjects(opts?: { featured?: boolean })`, `getProject(slug: string)`, `getPosts()`, `getPost(slug: string)`, `getPortfolioData(): Promise<PortfolioData>`. Signatures exactly as spec §3 (`getProject` → `{ meta, body } | null`). Uses `createContentReader(path.join(process.cwd(), 'src/content'), { includeDrafts: process.env.NODE_ENV !== 'production' })`. Mark the module `import 'server-only'`.

- [ ] **Step 1: Write failing tests** against fixtures (2 projects with `order` 2 and 1, one `featured: false`; 2 posts, one `draft: true`; one invalid file in `__fixtures__/invalid/projects/`):

```ts
it('sorts projects by order', async () => expect((await r.getProjects()).map(p => p.slug)).toEqual(['b', 'a']));
it('filters featured', async () => expect(await r.getProjects({ featured: true })).toHaveLength(1));
it('returns null for unknown slug', async () => expect(await r.getProject('nope')).toBeNull());
it('returns raw MDX body without frontmatter', async () => expect((await r.getProject('a'))!.body).not.toContain('---'));
it('excludes drafts unless includeDrafts', async () => {
  expect(await createContentReader(dir).getPosts()).toHaveLength(1);
  expect(await createContentReader(dir, { includeDrafts: true }).getPosts()).toHaveLength(2);
});
it('sorts posts newest first', ...);
it('throws with the filename on invalid frontmatter', async () =>
  await expect(createContentReader(invalidDir).getProjects()).rejects.toThrow(/broken\.mdx/));
it('uses the filename as slug when frontmatter slug mismatches → throws', ...);
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement with `fs/promises` + `gray-matter` + schema `.safeParse`. On failure, throw ``new Error(`Invalid frontmatter in ${file}: ${issues}`)``. Frontmatter `slug` must equal the filename stem.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(content): add async content layer with MDX frontmatter validation`

### Task 4: Project case studies and seed blog post

**Files:**
- Create: `src/content/projects/{6ammart,ajaxerp,alhisab,rebusel,gpsfreelancer}.mdx`, `src/content/blog/hello-world.mdx`, `src/lib/content.test.ts`

**Interfaces:**
- Consumes: `getProjects`, `getPosts` from Task 3.

- [ ] **Step 1: Write failing test** `content.test.ts` (real content):

```ts
it('loads the 5 CV projects in order', async () =>
  expect((await getProjects()).map(p => p.slug)).toEqual(['6ammart', 'ajaxerp', 'alhisab', 'rebusel', 'gpsfreelancer']));
it('getPortfolioData is JSON-serializable', async () => {
  const d = await getPortfolioData();
  expect(JSON.parse(JSON.stringify(d))).toEqual(d);
});
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Write the MDX files. Frontmatter comes from the CV (tech `['Laravel', 'MySQL']`, links: 6amMart `marketplace` → CodeCanyon URL `TODO(owner)`, AjaxERP live `https://staging.ajaxtradingcorp.com`, Alhisab live `https://web.alhisab.app`, Rebusel live `https://staging.rebusel.com`). `role` and `year` use `TODO(owner)` comments with best guesses from the experience dates. `featured: true` for the first four. Each body has sections `## Overview`, `## My role`, `## Architecture & key decisions`, `## Outcomes`, filled from the CV bullets, plus `{/* TODO(owner): metrics, screenshots */}`. The seed post `hello-world.mdx` is `draft: true`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(content): add project case studies from CV`

---

# Phase 2: Classic site

### Task 5: Design tokens, theming, fonts, layout shell

**Files:**
- Create: `src/app/globals.css` (replace), `src/components/site/theme-provider.tsx`, `src/components/site/theme-toggle.tsx`, `src/components/site/site-header.tsx`, `src/components/site/site-footer.tsx`, `src/app/(site)/layout.tsx`, `tests/e2e/theme.spec.ts`
- Modify: `src/app/layout.tsx` (fonts, `<html suppressHydrationWarning>`, metadataBase placeholder)
- Add deps: `next-themes`, `geist`

**Interfaces:**
- Produces: CSS tokens on `[data-theme=dark]` / `[data-theme=light]`: `--bg`, `--bg-elevated`, `--fg`, `--fg-muted`, `--border`, `--accent`, `--accent-fg`, `--grid`. They're exposed to Tailwind via `@theme inline` as `bg-bg`, `text-fg`, `text-fg-muted`, `border-border`, `bg-accent`, etc.
- Produces: `<ThemeProvider>` (next-themes, `attribute="data-theme"`, `defaultTheme="dark"`, `themes={['dark','light']}`, `enableSystem={false}`). The spec's "respect prefers-color-scheme only when no choice" is dropped in favour of D6, dark default. Note this in the commit body.
- Header: name (link `/`), nav (`Projects`, `Experience` → `/#experience`, `Blog`, `Resume`, `Contact` → `/#contact`), `ThemeToggle`. The footer contains the `Explore OS versions` link and socials from `getProfile()`.

- [ ] **Step 1: Write failing e2e test** `theme.spec.ts`:

```ts
test('defaults to dark, toggles to light, persists on reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('footer links to OS versions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Explore OS versions' })).toHaveAttribute('href', '/os');
});
```

- [ ] **Step 2:** Run `pnpm test:e2e tests/e2e/theme.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement. Dark palette: bg `#0a0a0b`, elevated `#121214`, fg `#ededed`, muted `#a1a1aa`, border `#27272a`, accent `#22d3ee` (cyan). Light: bg `#fafafa`, elevated `#ffffff`, fg `#18181b`, muted `#52525b`, border `#e4e4e7`, accent `#0e7490`. Verify AA contrast for fg/muted/accent on bg in both. Fonts: Geist Sans (body) and Geist Mono (`.font-mono` labels). Toggle `aria-label` is `Switch to light theme` / `Switch to dark theme`.
- [ ] **Step 4:** Run. Expected: PASS. Then `pnpm check`.
- [ ] **Step 5: Commit:** `feat(site): add theme tokens, dark/light toggle, header and footer`

### Task 6: Home page sections

**Files:**
- Create: `src/components/site/sections/{hero,about,skills,experience-timeline,featured-projects,education,contact-section}.tsx`, `src/components/site/project-card.tsx`, `src/components/ui/{button,badge,section-heading}.tsx`, `src/lib/format.ts`, `src/lib/format.test.ts`, `src/app/(site)/page.tsx`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: content API (Task 3).
- Produces: `formatDateRange(start: string, end: string | 'present'): string` → `'Mar 2025 – Mar 2026'`, `'Oct 2020 – Present'`, `'2013'` (year-only end with no start). `formatDuration(start, end, now?: Date): string` → `'1 yr 1 mo'`.
- Produces: `<ProjectCard project={ProjectFrontmatter} />` (reused on `/projects`).
- Section element ids: `about`, `skills`, `experience`, `projects`, `education`, `contact`.
- `ContactSection` renders email/socials now. Task 12 adds the form into it.

- [ ] **Step 1: Write failing unit tests** for `formatDateRange` (the three cases above) and `formatDuration` (`('2025-03','2026-03')` → `'1 yr 1 mo'` inclusive of both months; `('2020-10','2025-02')` → `'4 yrs 5 mos'`).
- [ ] **Step 2: Write failing e2e** `home.spec.ts`: one `h1` containing `Abu Bin Oalid`; each section id is visible after scrolling; `Download CV` link href is `/resume/abu-bin-oalid.pdf`; 4 featured project cards; on `mobile-safari`, no horizontal scroll (`document.documentElement.scrollWidth <= innerWidth`).
- [ ] **Step 3:** Run both. Expected: FAIL.
- [ ] **Step 4:** Implement the sections as Server Components per spec §5. Hero has a CSS-only grid background via `--grid`, availability pill, avatar via `next/image` (`priority`), and CTAs `View projects` (`/projects`), `Download CV`, `Contact` (`/#contact`). Experience is a vertical timeline using `formatDateRange` and `formatDuration`. Scroll-reveal animation is optional; if used, it's a tiny client wrapper that respects reduced motion.
- [ ] **Step 5:** Run unit + e2e + `pnpm check`. Expected: PASS.
- [ ] **Step 6:** Visually check with `pnpm dev` at 1440px and 390px in both themes.
- [ ] **Step 7: Commit:** `feat(site): build home page sections`

### Task 7: Projects index and case-study pages

**Files:**
- Create: `src/app/(site)/projects/page.tsx`, `src/app/(site)/projects/[slug]/page.tsx`, `src/components/mdx/mdx-components.tsx`, `src/components/mdx/render-mdx.tsx`, `src/components/site/project-header.tsx`, `src/components/site/project-header.test.tsx`, `tests/e2e/projects.spec.ts`
- Add deps: `next-mdx-remote`, `rehype-slug`, `rehype-pretty-code`, `shiki`

**Interfaces:**
- Produces: `renderMdx(source: string): Promise<ReactElement>` (wraps `compileMDX` from `next-mdx-remote/rsc` with the component map and rehype plugins). Used by blog too.
- Produces: `<ProjectHeader meta={ProjectFrontmatter} />` (title, summary, role, year, tech badges, link buttons, metrics grid, screenshots).
- `[slug]/page.tsx`: `generateStaticParams` from `getProjects()`, `dynamicParams = false`, `notFound()` on null.

- [ ] **Step 1: Write failing component test** (Review Focus #4):

```ts
it('renders no links/metrics/screenshots blocks when absent', () => {
  render(<ProjectHeader meta={{ ...base, links: undefined, metrics: undefined, screenshots: undefined }} />);
  expect(screen.queryByRole('heading', { name: /metrics/i })).toBeNull();
  expect(screen.queryByRole('link', { name: /live|source|marketplace/i })).toBeNull();
  expect(screen.queryAllByRole('img')).toHaveLength(0);
});
it('renders a Live link that opens in a new tab with rel noopener', ...);
```

- [ ] **Step 2: Write failing e2e:** `/projects` lists 5 cards; `/projects/alhisab` has `h1` `Alhisab` and an `Overview` heading; `/projects/does-not-exist` returns 404.
- [ ] **Step 3:** Run. Expected: FAIL.
- [ ] **Step 4:** Implement. MDX map styles `h2/h3/p/ul/a/code/pre/img`. External links use `target="_blank" rel="noopener noreferrer"`. Include a `← All projects` link.
- [ ] **Step 5:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 6: Commit:** `feat(site): add projects index and MDX case-study pages`

### Task 8: Blog index and post pages

**Files:**
- Create: `src/app/(site)/blog/page.tsx`, `src/app/(site)/blog/[slug]/page.tsx`, `src/components/site/post-list.tsx`, `tests/e2e/blog.spec.ts`

**Interfaces:**
- Consumes: `getPosts`, `getPost`, `renderMdx`.

- [ ] **Step 1: Write failing e2e:** in a production build with only a draft post, `/blog` shows the empty state `No posts yet. Check back soon.` and `/blog/hello-world` is a 404.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the list (title, date via `<time dateTime>`, summary, tags) and the post page (title, date, reading time = `Math.ceil(words/200)` min, body). `generateStaticParams` + `dynamicParams = false`.
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(site): add blog`

### Task 9: Resume page

**Files:**
- Create: `src/app/(site)/resume/page.tsx`, `src/app/print.css` (imported in the resume page), `tests/e2e/resume.spec.ts`

- [ ] **Step 1: Write failing e2e:** `/resume` shows all experience companies and a `Download PDF` link to `/resume/abu-bin-oalid.pdf`; `page.emulateMedia({ media: 'print' })` hides header, footer, and theme toggle.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement a single-column HTML resume from the content layer, with an `@media print` stylesheet (white background, black text, no chrome).
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(site): add printable resume page`

---

# Phase 3: SEO

### Task 10: Metadata, JSON-LD, sitemap, robots, OG image

**Files:**
- Create: `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/components/site/json-ld.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`, `src/app/sitemap.test.ts`, `src/app/robots.test.ts`, `tests/e2e/seo.spec.ts`
- Modify: `src/app/layout.tsx`, every `(site)` page (`generateMetadata` / `metadata`)

**Interfaces:**
- Produces (`seo.ts`): `siteUrl(): string` (from `NEXT_PUBLIC_SITE_URL`, no trailing slash), `buildMetadata(input: { title?: string; description: string; path: string; image?: string; type?: 'website' | 'article' | 'profile' }): Metadata` (canonical = `siteUrl()+path`, OG, Twitter `summary_large_image`), `personJsonLd(profile): WithContext<Person>`, `profilePageJsonLd(profile)`, `projectJsonLd(meta)` (`CreativeWork`), `postJsonLd(meta)` (`BlogPosting`), `breadcrumbJsonLd(items: { name: string; path: string }[])`. Add dev dep `schema-dts` for the types.
- Produces: `<JsonLd data={object} />` renders `<script type="application/ld+json">` with `JSON.stringify(data).replace(/</g, '\\u003c')`.

- [ ] **Step 1: Write failing unit tests:**

```ts
it('personJsonLd has name, jobTitle, sameAs socials, image absolute', ...);
it('buildMetadata sets absolute canonical', () =>
  expect(buildMetadata({ description: 'd', path: '/projects/alhisab' }).alternates?.canonical)
    .toBe('https://example.com/projects/alhisab'));  // with NEXT_PUBLIC_SITE_URL stubbed
it('JsonLd escapes </script>', ...);
it('sitemap includes /, /projects, each project, /blog, published posts, /resume and no /os', ...);
it('robots disallows /os/ and points to sitemap', ...);
```

- [ ] **Step 2: Write failing e2e** `seo.spec.ts`: `/` has `<title>` `Abu Bin Oalid · Senior Backend Engineer`, a `meta[name=description]`, `link[rel=canonical]`, and a JSON-LD script whose parsed `@type` includes `Person`; `/projects/alhisab` title is `Alhisab · Abu Bin Oalid`.
- [ ] **Step 3:** Run. Expected: FAIL.
- [ ] **Step 4:** Implement. OG image is 1200×630 via `next/og`: dark bg, name, title, `7+ years · PHP · Laravel · AWS`, avatar.
- [ ] **Step 5:** Run unit + e2e + `pnpm build`. Expected: PASS.
- [ ] **Step 6: Commit:** `feat(seo): add metadata, JSON-LD, sitemap, robots and OG image`

### Task 11: Lighthouse and bundle budgets in CI

**Files:**
- Create: `lighthouserc.json`, `scripts/check-bundle-budget.mjs`
- Modify: `.github/workflows/ci.yml`, `package.json` (`"budget": "node scripts/check-bundle-budget.mjs"`)

- [ ] **Step 1:** `lighthouserc.json`: `startServerCommand: "pnpm start"`, URLs `/` and `/projects/alhisab`, assertions `categories:performance|accessibility|best-practices|seo` `minScore: 0.95` (error).
- [ ] **Step 2:** The budget script parses the `pnpm build` route table output (saved with `pnpm build | tee .next/build-output.txt`) and fails if the `/` First Load JS is > 120 kB. Test by temporarily setting the limit to 1 kB: expect a non-zero exit with a message naming `/`. Then restore.
- [ ] **Step 3:** Add CI steps: build with tee → `pnpm budget` → `pnpm dlx @lhci/cli autorun`.
- [ ] **Step 4:** Run locally: `pnpm build | tee .next/build-output.txt && pnpm budget && pnpm dlx @lhci/cli autorun`. Expected: all pass. Fix any failures before committing.
- [ ] **Step 5: Commit:** `ci: enforce Lighthouse ≥95 and first-load JS budget`

---

# Phase 4: Contact

### Task 12: Contact form with Server Action

**Files:**
- Create: `src/lib/contact-schema.ts`, `src/lib/contact-schema.test.ts`, `src/app/actions/contact.ts`, `src/app/actions/contact.test.ts`, `src/components/site/contact-form.tsx`, `src/components/site/contact-form.test.tsx`
- Modify: `src/components/site/sections/contact-section.tsx`
- Add dep: `resend`

**Interfaces:**
- Produces: `contactSchema` (zod): `name` 2–80 chars, `email` valid, `message` 10–2000 chars, `website` (honeypot) must be empty string.
- Produces: `type ContactState = { status: 'idle' } | { status: 'success' } | { status: 'error'; message: string; fieldErrors?: Partial<Record<'name'|'email'|'message', string>> }`.
- Produces: `sendContact(prev: ContactState, formData: FormData): Promise<ContactState>` (`'use server'`). It takes an injectable sender for tests: export `createSendContact(send: (msg: { name; email; message }) => Promise<void>)`, and `sendContact` = `createSendContact(resendSender)`.
- Produces: `isContactFormEnabled(): boolean` → `Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL)`.
- `ContactSection` renders `<ContactForm action={sendContact} />` when enabled, otherwise a `mailto:` button `Email me`.

- [ ] **Step 1: Write failing tests:**

```ts
it('rejects short message with fieldErrors.message', ...);
it('honeypot filled → returns success without calling send', async () => {
  const send = vi.fn(); const action = createSendContact(send);
  expect(await action({ status: 'idle' }, fd({ ...valid, website: 'spam' }))).toEqual({ status: 'success' });
  expect(send).not.toHaveBeenCalled();
});
it('send throws → error state "Something went wrong. Please email me directly."', ...);
it('ContactForm shows field error text and success message "Thanks! I’ll get back to you soon."', ...);
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The form uses `useActionState`; the honeypot input is visually hidden with `tabIndex={-1}` and `autoComplete="off"`. Resend sends from `onboarding@resend.dev` (until a domain is verified) to `CONTACT_TO_EMAIL`, with `replyTo` set to the visitor's email.
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(contact): add contact form server action with mailto fallback`

---

# Phase 5: OS core

### Task 13: OS detection

**Files:**
- Create: `src/lib/os-detect.ts`, `src/lib/os-detect.test.ts`

**Interfaces:**
- Produces: `type DetectedOs = 'windows11' | 'windows10' | 'windows' | 'macos' | 'iphone' | 'ipad' | 'android' | 'samsung' | 'linux' | 'unknown'`; `type DetectInput` (spec §7); `detectOs(input: DetectInput): DetectedOs`; `readDetectInput(): Promise<DetectInput>` (browser-only: reads `navigator.userAgent`, `navigator.maxTouchPoints`, and, if `navigator.userAgentData` exists, `getHighEntropyValues(['platformVersion'])`; any rejection is swallowed); `osDisplayName(os: DetectedOs): string` (`'Windows 11'`, `'macOS'`, `'iPhone'`, …).

- [ ] **Step 1: Write failing table test** (use real UA strings):

| input | expected |
|---|---|
| Windows Chrome UA + platformVersion `'15.0.0'` | `windows11` |
| Windows Chrome UA + platformVersion `'13.0.0'` | `windows11` |
| Windows Chrome UA + platformVersion `'10.0.0'` | `windows10` |
| Windows Firefox UA, no platformVersion | `windows` |
| Mac Safari UA, maxTouchPoints 0 | `macos` |
| Mac Safari UA, maxTouchPoints 5 | `ipad` |
| iPhone Safari UA | `iphone` |
| Samsung Internet UA (`SamsungBrowser/…`) | `samsung` |
| Chrome on `SM-S918B` UA | `samsung` |
| Pixel Chrome UA | `android` |
| Ubuntu Firefox UA | `linux` |
| `''` | `unknown` |
| Googlebot UA | `unknown` |
| platformVersion `'garbage'` with Windows UA | `windows` |

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per spec §7 rule order: iPhone → iPad → Samsung → Android → macOS → Windows → Linux → unknown. Bot UAs (`/bot|crawler|spider/i`) → `unknown`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add pure OS detection`

### Task 14: OS types and registry

**Files:**
- Create: `src/os/core/types.ts`, `src/os/core/registry.ts`, `src/os/core/registry.test.ts`

**Interfaces:**
- Produces: `OsId`, `OsKind`, `AppId`, `OsRootProps = { data: PortfolioData }`, `OsSkinMeta = { id: OsId; name: string; kind: OsKind; status: 'ready' | 'coming-soon'; thumbnail: string }`.
- Produces (`registry.ts`): `skins: readonly OsSkinMeta[]` (metadata only, **no imports of skin code**). It includes `coming-soon` entries for `windows10`, `windows7`, `windowsxp`, `ubuntu`, `samsung`; these ids are typed as `ComingSoonId` and are not part of `OsId`. Also `getSkinMeta(id: string): OsSkinMeta | undefined`, `isReadyOsId(id: string): id is OsId`, `suggestSkinFor(detected: DetectedOs): OsSkinMeta | null`.
- Produces (`src/os/core/loaders.ts`, separate so the banner never pulls loaders): `skinLoaders: Record<OsId, () => Promise<{ default: ComponentType<OsRootProps> }>>`.

- [ ] **Step 1: Write failing tests:** `suggestSkinFor` maps `windows11|windows10|windows → windows11`, `macos|ipad → macos`, `iphone → iphone`, and `android|samsung|linux|unknown → null` (while those skins are coming-soon). `isReadyOsId('ubuntu') === false`. All ready ids are unique.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. `suggestSkinFor` returns only `status: 'ready'` skins.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add skin registry and suggestion mapping`

### Task 15: OS suggestion banner

**Files:**
- Create: `src/components/site/os-suggest-banner.tsx`, `src/components/site/os-suggest-banner.test.tsx`, `src/lib/safe-storage.ts`, `src/lib/safe-storage.test.ts`, `tests/e2e/os-banner.spec.ts`
- Modify: `src/app/(site)/layout.tsx`

**Interfaces:**
- Consumes: `readDetectInput`, `detectOs`, `osDisplayName` (Task 13), `suggestSkinFor` (Task 14).
- Produces: `safeStorage = { get(key, area?: 'local'|'session'): string | null; set(key, value, area?): void }`, where every call is try/catch and failures return `null` or no-op.
- Produces: `<OsSuggestBanner detect?: () => Promise<DetectedOs> />` (the injectable `detect` is for tests).

- [ ] **Step 1: Write failing component tests:**

```ts
it('renders nothing on the server/first render', ...);
it('shows "You're on macOS. View this portfolio as macOS?" with Open → /os/macos', ...);
it('Not now hides it and sets os-suggest-dismissed=1', ...);
it('does not show when os-suggest-dismissed=1', ...);
it('does not show for unknown', ...);
it('still shows and dismisses when localStorage throws', ...);  // Review Focus #1: stub getItem/setItem to throw
```

- [ ] **Step 2: Write failing e2e:** a context with a Mac Safari UA (`userAgent` option) on `/` sees the banner; clicking `Open` navigates to `/os/macos`. A Googlebot UA sees no banner.
- [ ] **Step 3:** Run. Expected: FAIL.
- [ ] **Step 4:** Implement. It's a fixed-bottom card with a slide-up entrance (no animation under reduced motion) and `role="region" aria-label="OS experience suggestion"`. Mount it in the `(site)` layout only.
- [ ] **Step 5:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 6: Commit:** `feat(os): suggest matching OS experience via dismissible banner`

### Task 16: `/os` routes, host, switcher, back-to-classic

**Files:**
- Create: `src/app/os/layout.tsx`, `src/app/os/page.tsx`, `src/app/os/[os]/page.tsx`, `src/os/core/os-host.tsx`, `src/os/core/os-switcher.tsx`, `src/os/core/back-to-classic.tsx`, `src/os/core/os-host.test.tsx`, `tests/e2e/os-routes.spec.ts`
- Create (placeholder until Tasks 21/22/24): `src/os/skins/{windows11,macos,iphone}/index.tsx`, each exporting a default component that renders `<p>{name} coming soon</p>` + `<BackToClassic />`

**Interfaces:**
- Consumes: registry + loaders (Task 14), `getPortfolioData` (Task 3).
- Produces: `/os/[os]/page.tsx`: `generateStaticParams` over ready ids, `dynamicParams = false`; `notFound()` if `!isReadyOsId`; renders `<OsHost id={id} data={await getPortfolioData()} />`.
- Produces: `<OsHost id: OsId; data: PortfolioData />` (client): `React.lazy(skinLoaders[id])` inside `Suspense` with a full-screen neutral loader.
- Produces: `<OsSwitcher current: OsId; variant: 'menu' | 'list' />` lists all `skins` (coming-soon items disabled, labelled `Coming soon`). `<BackToClassic />` is a link to `/` labelled `Back to classic view`.
- `/os` layout: `metadata.robots = { index: false, follow: true }`, full-viewport `<main>` with no site header or footer, `overflow: hidden` only on `/os/[os]`.
- `/os` page: gallery of skin cards (thumbnail, name, Open / Coming soon), `Back to classic view`, and the disclaimer copy.

- [ ] **Step 1: Write failing tests:** OsHost renders the loader then the lazy component (mock loader). e2e: `/os/windows11` has `meta[name=robots][content*=noindex]`; `/os/ubuntu` is a 404; `/os` shows the disclaimer text exactly; `/` network requests contain no chunk from `os/skins` (assert via `page.on('request')` URLs not matching `/skins/`; also confirmed by the budget in Task 11).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run + `pnpm check` + `pnpm build`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add /os gallery, lazy skin host and switcher`

### Task 17: Shared OS apps

**Files:**
- Create: `src/os/core/apps/{about,projects,experience,skills,resume,contact,browser}-app.tsx`, `src/os/core/apps/index.ts`, `src/os/core/apps/apps.test.tsx`, `src/os/core/apps/os-tokens.css`, `src/os/core/__fixtures__/portfolio-data.ts`

**Interfaces:**
- Consumes: `PortfolioData`; `sendContact` + `ContactForm` from Task 12 (the Contact app reuses `ContactForm` from `components/site`; allow this single import and document it in AGENTS.md rule 3 as a second bridge), `formatDateRange` (Task 6).
- Produces: `type AppDefinition = { id: AppId; title: string; icon: AppIconName; Component: ComponentType<{ data: PortfolioData; openApp: (id: AppId) => void }> }` and `apps: Record<AppId, AppDefinition>`. `terminal` is added in Task 18.
- Produces: `AppIconName` = the app ids; skins map these to their own icon art.
- Apps style themselves only with `--os-font`, `--os-bg`, `--os-fg`, `--os-muted`, `--os-accent`, `--os-radius`, `--os-border` (declared with fallbacks in `os-tokens.css`).
- Projects app: list → detail (in-app state), with an `Open full case study` link to `/projects/<slug>` (`target="_blank"`). Browser app: post list linking to `/blog/<slug>`, plus the empty state `No posts yet.`

- [ ] **Step 1: Write failing tests** (with fixture data): each app renders its key content (About shows name and title; Experience shows 3 companies in order; Projects list → click → shows detail and the case-study link; Resume has an `iframe` titled `Resume PDF` and a download link; Browser shows the empty state with zero posts).
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add shared skin-agnostic apps`

### Task 18: Terminal app

**Files:**
- Create: `src/os/core/apps/terminal/commands.ts`, `src/os/core/apps/terminal/commands.test.ts`, `src/os/core/apps/terminal/terminal-app.tsx`, `src/os/core/apps/terminal/terminal-app.test.tsx`
- Modify: `src/os/core/apps/index.ts` (register `terminal`)

**Interfaces:**
- Produces: `type TermEffect = { type: 'open'; app: AppId } | { type: 'clear' } | { type: 'navigate'; href: string }`; `runCommand(input: string, data: PortfolioData): { output: string[]; effect?: TermEffect }`.
- Commands: `help`, `whoami` (name + title), `about`/`cat about.txt` (summary), `ls` (`about.txt  projects/  experience/  skills/  resume.pdf  contact`), `ls projects` (slugs), `skills`, `experience`, `contact` (email + socials), `open <app>` (effect open; an unknown app prints `open: no such app: <x>`), `resume` (navigate to the PDF), `exit` (navigate `/`), `clear` (effect clear), `sudo …` (`Nice try. 🙂`).

- [ ] **Step 1: Write failing tests** (Review Focus #5):

```ts
it('trims and lowercases the command word', () => expect(runCommand('  WHOAMI  ', d).output[0]).toContain('Abu Bin Oalid'));
it('empty input → no output, no effect', () => expect(runCommand('   ', d)).toEqual({ output: [] }));
it('unknown → command not found message', () =>
  expect(runCommand('foo bar', d).output).toEqual(["command not found: foo. Type 'help'."]));
it('open projects → effect', () => expect(runCommand('open projects', d).effect).toEqual({ type: 'open', app: 'projects' }));
it('exit → navigate /', ...);
it('TerminalApp: ArrowUp recalls previous command; Enter runs; clear empties history', ...);
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The UI uses a mono font, a prompt `oalid@portfolio:~$`, autofocus on the input, an `aria-live="polite"` output region, and a welcome line: `Welcome! Type 'help' to see available commands.`
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add terminal app`

---

# Phase 6: Desktop engine + Windows 11

### Task 19: Window store

**Files:**
- Create: `src/os/core/desktop/window-store.ts`, `src/os/core/desktop/window-store.test.ts`
- Add dep: `zustand`

**Interfaces:**
- Produces: `type WinState = { id: string; appId: AppId; title: string; x: number; y: number; w: number; h: number; z: number; mode: 'normal' | 'minimized' | 'maximized' }`.
- Produces: `createWindowStore(opts: { viewport: () => { w: number; h: number }; topInset?: number; bottomInset?: number })` returning a Zustand store `{ windows: WinState[]; focusedId: string | null; open(appId, title); close(id); focus(id); minimize(id); toggleMaximize(id); move(id, x, y); resize(id, w, h); clampAll() }`.
- Rules: `open` on an already-open app focuses it (restoring if minimized) instead of duplicating. New windows cascade by +32px from the last one. The default size is `min(900, vw-80) × min(600, vh-120)`. `focus` sets `z = max+1`. Minimizing the focused window focuses the next-highest visible one. Min size is 320×200.
- **Clamping (Review Focus #3):** after `move` or `clampAll`, at least 120px of the title bar (height 40) stays within the horizontal viewport, and `y` is within `[topInset, vh - bottomInset - 40]`.

- [ ] **Step 1: Write failing tests** for each rule above, including:

```ts
it('move far off-screen right keeps 120px visible', () => { s.move(id, 99999, 50); expect(win().x).toBe(vw - 120); });
it('move above top inset clamps to topInset', ...);
it('clampAll after viewport shrink pulls windows back', ...);
it('resize enforces 320x200 minimum', ...);
it('open twice → one window, focused', ...);
```

- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add desktop window store with clamping`

### Task 20: Desktop engine components

**Files:**
- Create: `src/os/core/desktop/desktop-shell.tsx`, `src/os/core/desktop/window.tsx`, `src/os/core/desktop/desktop-icon.tsx`, `src/os/core/desktop/small-screen-notice.tsx`, `src/os/core/desktop/use-reduced-motion.ts`, `src/os/core/desktop/window.test.tsx`, `src/os/core/desktop/desktop-shell.test.tsx`

**Interfaces:**
- Consumes: window store (Task 19), `apps` (Tasks 17–18).
- Produces: `type WindowChromeProps = { title: string; focused: boolean; mode: WinState['mode']; onClose(): void; onMinimize(): void; onToggleMaximize(): void; dragHandleProps: HTMLAttributes<HTMLElement> }`.
- Produces: `<DesktopShell data skin={{ wallpaper: ReactNode; WindowChrome: ComponentType<WindowChromeProps>; renderIcon(app: AppIconName): ReactNode; topBar?: ReactNode; bottomBar: (api: DesktopApi) => ReactNode; desktopIcons: AppId[]; insets: { top: number; bottom: number }; mobileAlternative: OsId }} />`.
- Produces: `type DesktopApi = { windows: WinState[]; focusedId: string | null; openApp(id: AppId): void; focus(id: string): void; minimize(id: string): void }` (passed to the taskbar or dock).
- Window behavior: pointer-drag via `dragHandleProps` (pointer capture); 8px resize handles on edges and corners; double-click on the drag handle toggles maximize; `pointerdown` focuses; `role="dialog" aria-label={title}`; focus moves into the window on open; `Escape` doesn't close windows. Keyboard: `Alt+F4` closes the focused window (Windows skins); macOS passes `Meta+W`. The shortcut is a prop: `closeShortcut: (e: KeyboardEvent) => boolean`.
- Resizing the viewport calls `clampAll` (via a `resize` listener).
- `<SmallScreenNotice mobileAlternative />` renders below 768px: `This desktop experience works best on larger screens.` with buttons `Open {mobile name}` and `Back to classic view`.

- [ ] **Step 1: Write failing tests:** double-clicking a desktop icon opens a window with dialog role and the app title; clicking a second window raises its z-index; the close button (from a test chrome) removes it; at a 500px viewport the notice is shown and no windows render.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. Window open/close/minimize animations use Framer Motion (scale+opacity, 150ms), disabled under reduced motion.
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add desktop engine (windows, icons, shell)`

### Task 21: Windows 11 skin

**Files:**
- Create: `src/os/skins/windows11/{index.tsx,taskbar.tsx,start-menu.tsx,window-chrome.tsx,icons.tsx,boot-screen.tsx,theme.css}`, `public/os/windows11/wallpaper.avif`, `public/os/windows11/CREDITS.md`, `src/os/core/boot.tsx`, `src/os/core/boot.test.tsx`, `tests/e2e/os-windows11.spec.ts`
- Modify: `src/os/core/loaders.ts` (point to the real skin)

**Interfaces:**
- Consumes: `DesktopShell`, `WindowChromeProps`, `OsSwitcher`, `BackToClassic`.
- Produces: `<BootGate id: OsId; Screen: ComponentType; durationMs?: number (default 1200, max 1500) > {children}</BootGate>` (shared by all skins): shows the Screen unless reduced motion or `sessionStorage['os-booted-<id>']`; click or key skips; sets the flag when done.

- [ ] **Step 1: Write failing tests:** BootGate skips when the flag is set, skips under reduced motion, and sets the flag after the duration (fake timers). e2e: visit `/os/windows11` → skip boot → taskbar visible; click Start → menu shows pinned apps and `Back to classic view`; open `About` from Start → a dialog `About` contains `Abu Bin Oalid`; minimize via the taskbar button and restore; the Terminal command `open projects` opens a Projects window.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per spec §8: centered taskbar (Start, pinned apps with open-indicator dots, clock in the tray via `Intl.DateTimeFormat`), Start menu (pinned grid, user tile with avatar + name, `Switch OS` → OsSwitcher, `Back to classic view`), window chrome (min/max/close on the right, 8px radius, translucent `backdrop-filter` Mica-ish), Segoe-like font stack `'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif`, original abstract wallpaper (generated gradient/SVG → AVIF, documented in CREDITS.md), and boot screen (original logo-less spinner + name). `closeShortcut` is Alt+F4. `mobileAlternative: 'iphone'`.
- [ ] **Step 4:** Run + `pnpm check` + `pnpm build && pnpm budget`. Expected: PASS.
- [ ] **Step 5:** Visually check in the browser at 1440×900 and 1920×1080.
- [ ] **Step 6: Commit:** `feat(os): add Windows 11 skin`

---

# Phase 7: macOS

### Task 22: macOS skin

**Files:**
- Create: `src/os/skins/macos/{index.tsx,menu-bar.tsx,dock.tsx,window-chrome.tsx,icons.tsx,boot-screen.tsx,theme.css}`, `public/os/macos/wallpaper.avif`, `public/os/macos/CREDITS.md`, `tests/e2e/os-macos.spec.ts`
- Modify: `src/os/core/loaders.ts`

**Interfaces:**
- Consumes: same as Task 21, plus `BootGate`.

- [ ] **Step 1: Write failing e2e:** `/os/macos` → menu bar visible with clock; the system menu (labelled `System menu`) contains `About this portfolio`, `Switch OS…`, and `Back to classic view`; clicking the Dock `Projects` icon opens a dialog `Projects`; the red close button (`aria-label="Close"`) closes it; the menu bar shows the focused app's name.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per spec §8: top menu bar (28px; left: system menu glyph — **not the Apple logo**, use an original glyph — then the focused app name; right: clock), Dock (bottom, magnification on hover via Framer Motion springs, disabled under reduced motion; running indicators), traffic-light chrome on the left, vibrancy backdrop, font stack `-apple-system, BlinkMacSystemFont, 'Inter', system-ui, sans-serif`. `closeShortcut` is Meta+W. `insets: { top: 28, bottom: 80 }`. `mobileAlternative: 'iphone'`.
- [ ] **Step 4:** Run + `pnpm check` + build + budget. Expected: PASS.
- [ ] **Step 5:** Visual check at 1440×900.
- [ ] **Step 6: Commit:** `feat(os): add macOS skin`

---

# Phase 8: Mobile engine + iPhone

### Task 23: Mobile engine

**Files:**
- Create: `src/os/core/mobile/{mobile-shell.tsx,app-stack-store.ts,app-stack-store.test.ts,home-screen.tsx,app-screen.tsx,device-frame.tsx,status-bar-clock.tsx,mobile-shell.test.tsx}`

**Interfaces:**
- Consumes: `apps` (Tasks 17–18).
- Produces: `createAppStackStore()` → `{ current: AppId | null; openApp(id); goHome() }` (single app at a time; opening another replaces it).
- Produces: `<MobileShell data skin={{ wallpaper; renderIcon(app); StatusBar: ComponentType; homeApps: AppId[]; dockApps: AppId[]; HomeIndicator: ComponentType<{ onHome(): void }>; AppHeader: ComponentType<{ title: string; onBack(): void }> }} />`.
- `<DeviceFrame>`: at viewport ≥ 768px, renders children inside a centered 390×844 frame with a rounded bezel. Below that, it's full-screen. Swipe-up gesture: a pointer drag starting within 24px of the bottom edge and moving more than 80px up calls `goHome`. The `HomeIndicator` is also a button labelled `Go home`.
- The Terminal app on mobile is in `homeApps` too; the input must not be covered by the on-screen keyboard (`scrollIntoView` on focus).

- [ ] **Step 1: Write failing tests:** the store opens/replaces/goes home; MobileShell taps the `Projects` icon → app screen with header `Projects`; `Go home` returns to the grid; the swipe-up gesture (simulated pointer events) returns home.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement. The open animation zooms from the icon position (Framer `layoutId`), and there's no animation under reduced motion.
- [ ] **Step 4:** Run + `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat(os): add mobile engine (home screen, app stack, device frame)`

### Task 24: iPhone skin

**Files:**
- Create: `src/os/skins/iphone/{index.tsx,status-bar.tsx,home-indicator.tsx,app-header.tsx,icons.tsx,theme.css}`, `public/os/iphone/wallpaper.avif`, `public/os/iphone/CREDITS.md`, `tests/e2e/os-iphone.spec.ts`
- Modify: `src/os/core/loaders.ts`

- [ ] **Step 1: Write failing e2e** (run in both `mobile-safari` and `chromium` projects): `/os/iphone` shows the status bar time and a home grid with app labels; tap `About` → `Abu Bin Oalid` is visible; `Go home` returns; on chromium (1440px) the device frame is rendered (`data-testid="device-frame"`); the home screen has a `Settings`-style app named `Switch OS` that lists all skins and `Back to classic view`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per spec §8: status bar (time left; signal/wifi/battery glyphs right — original SVGs), Dynamic Island pill (decorative, `aria-hidden`), 4-column icon grid with labels, dock with 4 apps (`about`, `projects`, `contact`, `terminal`), iOS-like large-title app header with a `‹ Back` button, home indicator bar. `Switch OS` is a pseudo-app defined inside the skin (it renders `OsSwitcher variant="list"` + `BackToClassic`). Font stack is the same as macOS.
- [ ] **Step 4:** Run + `pnpm check` + build + budget. Expected: PASS.
- [ ] **Step 5:** Visual check on a 390×844 viewport and at desktop width.
- [ ] **Step 6: Commit:** `feat(os): add iPhone skin`

---

# Phase 9: Polish and launch

### Task 25: Accessibility and cross-browser pass

**Files:**
- Create: `tests/e2e/a11y.spec.ts`
- Modify: whatever the scan flags

- [ ] **Step 1: Write failing/initial e2e:** run `@axe-core/playwright` on `/`, `/projects/alhisab`, `/resume`, `/os`, `/os/windows11` (after skipping boot), `/os/macos`, `/os/iphone`, in both themes for classic pages. Assert zero `serious`/`critical` violations.
- [ ] **Step 2:** Run. Fix every violation.
- [ ] **Step 3:** Manual keyboard pass: tab through the home page (visible focus ring on everything), open and close a window in each desktop skin using only the keyboard, and confirm reduced motion (`page.emulateMedia({ reducedMotion: 'reduce' })`) removes the boot screen and animations.
- [ ] **Step 4:** Run the full suite: `pnpm check && pnpm build && pnpm budget && pnpm test:e2e && pnpm dlx @lhci/cli autorun`. Expected: all green.
- [ ] **Step 5: Commit:** `fix(a11y): resolve axe findings and keyboard issues`

### Task 26: Deploy and indexing (owner + agent)

**Files:**
- Create: `README.md` (what it is, how to run, how to edit content, how to add a skin)
- Modify: `.env.example` (final list)

- [ ] **Step 1:** Write the README sections: *Overview*, *Run locally*, *Edit your content* (which file holds what), *Write a blog post*, *Add a new OS skin* (the 2-step recipe from AGENTS.md rule 7), *Deploy*.
- [ ] **Step 2 (owner):** Create a GitHub repo and push; import it into Vercel; set `NEXT_PUBLIC_SITE_URL` (final domain), `RESEND_API_KEY`, `CONTACT_TO_EMAIL`; attach the custom domain.
- [ ] **Step 3:** On the production URL, check `/sitemap.xml`, `/robots.txt`, OG preview (LinkedIn Post Inspector), and Rich Results Test for `/`. Expected: Person detected, no errors.
- [ ] **Step 4 (owner):** Verify the domain in Google Search Console and Bing Webmaster Tools, then submit the sitemap.
- [ ] **Step 5: Commit:** `docs: add README and deployment guide`

---

## Later (separate spec → plan each)

- Skins: Windows 10, Windows 7, Windows XP, Ubuntu (desktop engine), Samsung One UI / Android (mobile engine). Each is a new `src/os/skins/<id>/` folder + registry status flip + loader entry + e2e spec.
- Backend phase: DB (Postgres + Drizzle), admin for content, view counter, contact rate limiting, testimonials.
