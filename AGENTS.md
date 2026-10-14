# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Copilot, Codex, etc.) working in this repo.
This file is the single source of truth. Tool-specific files (`CLAUDE.md`, `.github/copilot-instructions.md`) point here.

## Project

Personal portfolio of **Abu Bin Oalid**, Senior Backend Engineer (PHP/Laravel).

- **Default experience:** a fast, SEO-optimized classic portfolio (dark technical theme + light minimal theme).
- **Optional "OS experiences":** the same content inside recreated OS UIs at `/os/<id>` (v1: `windows11`, `macos`, `iphone`).
- The visitor's OS is detected **client-side after hydration** and a matching OS experience is *suggested* via a dismissible banner. Never auto-redirect.

Full design: `docs/superpowers/specs/2026-10-15-os-portfolio-design.md`
Implementation plan: `docs/superpowers/plans/2026-10-15-os-portfolio.md`

## Stack

Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS v4 · Framer Motion · MDX (`next-mdx-remote/rsc`) · Zustand (OS window state) · zod · next-themes · Vitest + React Testing Library · Playwright · pnpm · Vercel.

## Commands

```bash
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build (must pass before any PR)
pnpm start          # serve production build
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit
pnpm test           # Vitest unit + component tests
pnpm test:e2e       # Playwright (builds + starts the app)
pnpm check          # lint + typecheck + test (run before committing)
```

## Architecture rules (do not break these)

1. **Content is written once.** All portfolio data lives in `src/content/` (TS files + MDX). UI code reads it **only** through `src/lib/content.ts` (`getProfile()`, `getProjects()`, `getPortfolioData()`, …). Never import `src/content/**` from anywhere else. Never hardcode personal info (name, email, links) in components.
2. **Content functions are async.** They will later be backed by a database; keep signatures `Promise<...>`.
3. **Classic site and OS code are separate.** `src/components/site/**` must not import `src/os/**`, and vice versa. Two allowed bridges: `OsSuggestBanner` may import `src/lib/os-detect.ts` and registry *metadata* (no skin code, never `loaders.ts`), and the OS Contact app may import `src/components/site/contact-form.tsx`.
4. **Skins are isolated.** `src/os/skins/<id>/**` imports only from `src/os/core/**`, `src/components/ui/**`, and `src/lib/**`. Skins never import other skins. Each skin is lazy-loaded so it becomes its own chunk.
5. **OS apps are shared.** App bodies (About, Projects, Terminal, …) live in `src/os/core/apps/` and receive data via props (`PortfolioData`). Skins style them with CSS variables (`--os-*`) and provide window/screen chrome; they do not re-implement app content.
6. **SEO surface = classic site only.** `/os/*` is `noindex` (layout metadata + `robots.ts` disallow) and excluded from `sitemap.ts`. Server HTML must be identical for every visitor. OS detection runs only in `useEffect`.
7. **Adding a new OS skin** = new folder `src/os/skins/<id>/` + one entry in `src/os/core/registry.ts` (+ add the id to `OsId`). No changes to content or classic site.

## Directory map

```
src/app/(site)/        classic pages (indexed)
src/app/os/            OS gallery + /os/[os] host (noindex)
src/content/           data: profile.ts, skills.ts, experience.ts, education.ts, projects/*.mdx, blog/*.mdx
src/lib/               content.ts, seo.ts, os-detect.ts, utils.ts
src/components/site/   classic-site sections
src/components/ui/     shared primitives
src/components/mdx/    MDX component map
src/os/core/           types, registry, apps/, desktop/ (window engine), mobile/ (app-stack engine)
src/os/skins/<id>/     per-OS chrome & theme
tests/e2e/             Playwright specs
```

## Conventions

- TypeScript strict; no `any` (use `unknown` + narrowing). Validate external/file data with zod.
- Server Components by default; add `'use client'` only where interactivity is needed, as low in the tree as possible.
- File names: `kebab-case.tsx`; components `PascalCase`; hooks `useThing`.
- Styling: Tailwind utilities + CSS variables for theme tokens (defined in `src/app/globals.css`). No inline hex colors in components; use tokens.
- Use `next/image` for images and `next/link` for internal links.
- Accessibility: real `<button>`s for actions, labels on icon buttons, one `h1` per page, respect `prefers-reduced-motion`.
- Browser storage (`localStorage`) only for per-visitor conveniences (theme, banner dismissed), and always wrapped in try/catch.
- Keep files focused (aim < 200 lines). Split when a file does two things.

## Testing expectations

- Write the test first for logic: `detectOs`, content layer, window store, terminal parser, form validation.
- Component tests for interactive pieces (banner, window, contact form).
- E2E smoke for each route family and each OS skin.
- Never claim something works without running `pnpm check` (and `pnpm build` for route/SEO changes).

## Assets and legal

Do not add official OS logos, wallpapers, or proprietary system fonts. Use original or freely licensed assets (record the source/license in `public/os/<id>/CREDITS.md`). Keep the "fan-made, not affiliated" notice on `/os`.

## Personal data

Content in `src/content/` is public by design (it's a portfolio). Do not add anything not already present in the owner's CV or explicitly provided by the owner. Secrets (e.g. `RESEND_API_KEY`) go in `.env.local`, never committed. Document new env vars in `.env.example`.
