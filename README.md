# Abu Bin Oalid: portfolio

Personal portfolio of Abu Bin Oalid, Senior Backend Engineer (PHP/Laravel).

## 1. Overview

- **Classic site** (`/`, `/projects`, `/blog`, ...): fast, SEO-optimised, dark technical theme plus a light minimal theme. This is the only part search engines index.
- **8 OS experiences** at `/os/<id>`: the same content rendered inside fan-made recreations of an operating system UI. Ids: `windows11`, `macos`, `iphone`, `windows10`, `windows7`, `windowsxp`, `ubuntu`, `samsung`. `/os` is the gallery. All `/os/*` pages are `noindex` and left out of the sitemap.
- **OS detection:** after hydration (client side only) the classic site shows a dismissible banner suggesting the matching OS experience. It never redirects.

Stack: Next.js (App Router), React, TypeScript, Tailwind v4, MDX, Zustand, zod, Vitest, Playwright, pnpm, Vercel.
Think of it as: `src/content/` is your "database", `src/lib/content.ts` is the repository/service layer, everything else is views.

Design spec: [`docs/superpowers/specs/2026-10-15-os-portfolio-design.md`](docs/superpowers/specs/2026-10-15-os-portfolio-design.md)
Implementation plan: [`docs/superpowers/plans/2026-10-15-os-portfolio.md`](docs/superpowers/plans/2026-10-15-os-portfolio.md)
Contributor/agent rules (architecture boundaries): [`AGENTS.md`](AGENTS.md)

## 2. Run locally

Requires Node 24 and pnpm.

```bash
pnpm install
cp .env.example .env.local   # optional; see section 6 for the variables
pnpm dev                     # http://localhost:3000
```

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (drafts are visible) |
| `pnpm build` / `pnpm start` | Production build / serve it |
| `pnpm check` | `lint` + `typecheck` + `test`. Run before every commit |
| `pnpm lint`, `pnpm typecheck`, `pnpm test` | The three parts of `check` (`test` is Vitest) |
| `pnpm test:e2e` | Playwright. Builds and starts the app itself. Uses your installed **Google Chrome** (`channel: 'chrome'`), so no browser download is needed |
| `pnpm budget` | Gzipped first-load JS check for `/` (limit 160 kB). Run after `pnpm build` |

Before `pnpm test:e2e`, make sure nothing is listening on :3000 (`fuser -k 3000/tcp`). Playwright reuses an existing server and a stale one gives false failures.

## 3. Edit your content

All content lives in `src/content/`. UI code never hardcodes personal data.

| What | File |
|---|---|
| Name, title, tagline, summary, email, phone, availability, social links, avatar/CV paths | `src/content/profile.ts` |
| Skill groups | `src/content/skills.ts` |
| Work history | `src/content/experience.ts` |
| Education | `src/content/education.ts` |
| Projects (one MDX file each) | `src/content/projects/*.mdx` |
| Blog posts (one MDX file each) | `src/content/blog/*.mdx` |
| Field rules (zod; a bad value fails the build/tests) | `src/content/schemas.ts` |
| Profile photo | `public/images/profile.jpg` (replace the file) |
| CV / resume PDF | `public/resume/abu-bin-oalid.pdf` (replace the file; keep the name or update `resumePdf` in `profile.ts`) |
| Project screenshots | `public/images/projects/<slug>/` |

Project frontmatter shape: `slug, title, summary, tech[], role, year, featured, order`, optional `links {live, source, marketplace}`, `cover`, `screenshots[]`, `metrics[{label, value}]`. The MDX body below it is the case study.

**Placeholders:** anything the owner has not confirmed is marked `TODO(owner): ...`. Find them all with `grep -rn "TODO(owner)" src`, and see [`docs/CONTENT-NEEDED.md`](docs/CONTENT-NEEDED.md) for the checklist (availability, tagline, domain, project roles/years/metrics/screenshots, and so on). Replace each, then tick it off.

## 4. Write a blog post

Create `src/content/blog/<slug>.mdx`. The filename should match `slug`.

```mdx
---
slug: my-first-post
title: Multi-tenant Laravel without the pain
summary: One or two sentences, used in lists, meta description and social cards.
publishedAt: '2026-11-02'
updatedAt: '2026-11-09'
tags: [laravel, architecture]
draft: false
---

Write Markdown/MDX here. Headings get anchor ids automatically and code blocks are syntax highlighted.
```

Rules (from `postFrontmatterSchema`): `slug`, `title`, `summary`, `publishedAt` and `tags` are required; `updatedAt` and `draft` are optional. Dates must be quoted `'YYYY-MM-DD'` strings (unquoted, YAML turns them into Date objects and validation fails).

**Drafts:** with `draft: true` a post shows in `pnpm dev` but is hidden in production (`NODE_ENV=production`: list, post page and sitemap). Flip to `false` or remove the line to publish. The shipped `hello-world.mdx` is a draft placeholder; replace it with a real post.

## 5. Add a new OS skin

Skins are isolated: a skin imports only from `src/os/core/**`, `src/components/ui/**` and `src/lib/**`, never another skin. App bodies (About, Projects, Terminal, ...) are shared in `src/os/core/apps/`; a skin only provides chrome and theme.

1. **Id:** add it to the `OsId` union in `src/os/core/types.ts`.
2. **Registry:** add an entry to `skins` in `src/os/core/registry.ts` (`id`, `name`, `kind: 'desktop' | 'mobile'`, `status: 'ready'`). If a detected OS should suggest it, add it to the `SUGGESTED_ID` map in the same file.
3. **Loader:** add `id: () => import('../skins/<id>')` to `skinLoaders` in `src/os/core/loaders.ts` (keeps each skin its own lazy chunk; TypeScript will error until you do, since it is a `Record<OsId, ...>`).
4. **Skin folder:** create `src/os/skins/<id>/`, copying the closest existing one (desktop: `windows11` or `ubuntu`; mobile: `iphone` or `samsung`). Typical files: `index.tsx` (default export taking `OsRootProps`), `theme.css`, `icons.tsx`, `boot-screen.tsx`, `window-chrome.tsx`, plus taskbar/dock/status-bar as needed.
5. **Root + tokens:** the root element must carry `data-os-skin="<id>"`, and `theme.css` must scope everything under `[data-os-skin='<id>']` and set the shared tokens `--os-font`, `--os-mono`, `--os-bg`, `--os-fg`, `--os-muted`, `--os-accent`, `--os-radius`, `--os-border` (see `src/os/core/apps/os-tokens.css`). Shared apps are styled from these.
6. **Assets and credits:** original or freely licensed assets only, in `public/os/<id>/`, with a `public/os/<id>/CREDITS.md` listing source and license for each.
7. **E2E:** add `tests/e2e/os-<id>.spec.ts`, mirroring an existing one (loads `/os/<id>`, boot, open an app, window or screen behaviour).
8. Run `pnpm check`, `pnpm build`, `pnpm test:e2e`.

No change to content or the classic site is needed.

## 6. Deploy (Vercel)

Environment variables (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Final public origin, e.g. `https://yourdomain.dev` (no trailing slash). Drives canonical URLs, sitemap, robots, OG tags |
| `RESEND_API_KEY` | Resend key for sending contact mail |
| `CONTACT_TO_EMAIL` | Inbox that receives messages |

**Set all three at build time.** The home page is statically generated, and the contact form is shown or hidden based on whether `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are both present when it is built. In Vercel, add them under Project Settings > Environment Variables for Production, then **redeploy** after any change. Without them the site works but the form is disabled.

Resend: until you verify a sending domain in Resend, mail is sent from `onboarding@resend.dev` (Resend only delivers such mail to the account owner's address, which is fine for a personal inbox).

### Owner checklist

- [ ] Replace placeholders (`TODO(owner)`, `docs/CONTENT-NEEDED.md`), the CV PDF and the photo
- [ ] `pnpm check && pnpm build && pnpm test:e2e` pass locally
- [ ] Create a GitHub repo and push this repo to it
- [ ] Import the repo into Vercel (framework preset: Next.js, defaults are fine)
- [ ] Set `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL` in Vercel, then deploy
- [ ] Attach the custom domain in Vercel, update `NEXT_PUBLIC_SITE_URL` to it and redeploy
- [ ] On production, check `/sitemap.xml` (classic pages only, no `/os`) and `/robots.txt` (disallows `/os`, lists the sitemap)
- [ ] Share the URL in LinkedIn Post Inspector to check the OG preview
- [ ] Run `/` through Google Rich Results Test: expect a Person detected, no errors
- [ ] Send a test message through the contact form
- [ ] Verify the domain in Google Search Console and Bing Webmaster Tools, then submit `https://<domain>/sitemap.xml` in both

## 7. Legal note

The OS experiences are fan-made recreations for a personal portfolio. They are not affiliated with or endorsed by Microsoft, Apple, Samsung or Canonical. No vendor logos, wallpapers, icons or proprietary fonts are used; all visuals are original or freely licensed, with sources in `public/os/<id>/CREDITS.md`. Keep the disclaimer on `/os`.
