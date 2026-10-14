# OS Portfolio — Design Spec

- **Date:** 2026-10-15
- **Owner:** Abu Bin Oalid (Senior Backend Engineer, PHP/Laravel)
- **Status:** Draft for review

## 1. Goal

A personal portfolio that is, by default, a fast, professional, SEO-optimized site that works for every visitor (recruiters, clients, developers). On top of that, it offers optional **"OS experiences"**: the same portfolio content presented inside a recreated operating-system UI (Windows 11, macOS, iPhone in v1; more later). The visitor's OS is detected and a matching experience is *suggested*, never forced.

### Success criteria

1. A recruiter landing on `/` finds name, role, projects, and contact within ~10 seconds, on desktop and phone.
2. The default site scores ≥ 95 on Lighthouse for Performance, Accessibility, Best Practices, and SEO.
3. Google indexes the home page, every project page, and every blog post with correct titles, descriptions, and Person structured data.
4. A visitor on Windows / macOS / iPhone sees a dismissible suggestion to open the matching OS experience.
5. Every OS experience shows the same content as the classic site, read from the same source, with no duplicated content in code.
6. Adding a new OS skin later requires **no changes** to the content layer or the classic site. It only adds a new skin folder plus a registry entry.

## 2. Decisions log

| # | Decision | Choice |
|---|----------|--------|
| D1 | Default experience | Classic professional portfolio. OS experiences are opt-in. |
| D2 | OS detection behavior | **Suggest**: a dismissible banner offers the matching OS. No auto-redirect. |
| D3 | Stack | Next.js (App Router) + React + TypeScript + Tailwind CSS + Framer Motion + MDX |
| D4 | v1 OS skins | Windows 11, macOS, iPhone |
| D5 | Content source | Typed TS files + MDX in the repo, behind a content layer (swappable for a DB later) |
| D6 | Visual style | Dark, technical, engineer-focused (default), plus a selectable light "minimal" theme |
| D7 | Backend (future) | Same Next.js project: Route Handlers + Server Actions + DB (later phase) |
| D8 | SEO strategy | Classic site is the only indexed surface. `/os/*` routes are `noindex`. |
| D9 | Package manager / hosting | pnpm, Vercel |

## 3. Content model

All content is typed. Types live in `src/content/types.ts`.

```ts
type Profile = {
  name: string;               // "Abu Bin Oalid"
  title: string;              // "Senior Backend Engineer"
  tagline: string;            // one-line pitch
  summary: string;            // career objective paragraph
  location: string;           // "Dhaka, Bangladesh"
  yearsOfExperience: number;  // 7
  availability: 'open' | 'freelance' | 'not-looking';
  email: string;
  phone?: string;
  avatar: string;             // /images/profile.jpg
  resumePdf: string;          // /resume/abu-bin-oalid.pdf
  socials: { label: string; url: string; icon: SocialIcon }[];
};

type SkillGroup = { id: string; label: string; skills: string[] };

type Experience = {
  id: string; company: string; role: string; location: string;
  start: string; end: string | 'present';   // ISO "2025-03"
  highlights: string[]; tech?: string[];
};

type Education = {
  id: string; institution: string; degree: string; location: string;
  start?: string; end: string; grade?: string;
};

// Projects and blog posts are MDX files with typed frontmatter.
type ProjectFrontmatter = {
  slug: string; title: string; summary: string;
  tech: string[]; role: string; year: number;
  featured: boolean; order: number;
  links?: { live?: string; source?: string; marketplace?: string };
  cover?: string; screenshots?: string[];
  metrics?: { label: string; value: string }[];   // e.g. "Report time" / "8s → 1.2s"
};

type PostFrontmatter = {
  slug: string; title: string; summary: string;
  publishedAt: string; updatedAt?: string; tags: string[]; draft?: boolean;
};

// Everything an OS experience needs, plain JSON (no React nodes, no MDX).
type PortfolioData = {
  profile: Profile; skills: SkillGroup[]; experience: Experience[];
  education: Education[]; projects: ProjectFrontmatter[]; posts: PostFrontmatter[];
};
```

MDX bodies are rendered only on the classic site (`next-mdx-remote/rsc`). Frontmatter is validated with `zod` at load time, so a malformed file fails the build.

**Content layer API** (`src/lib/content.ts`). This is the *only* way UI code reads content:

```ts
getProfile(): Promise<Profile>
getSkillGroups(): Promise<SkillGroup[]>
getExperience(): Promise<Experience[]>          // newest first
getEducation(): Promise<Education[]>
getProjects(opts?: { featured?: boolean }): Promise<ProjectFrontmatter[]>   // sorted by order
getProject(slug): Promise<{ meta: ProjectFrontmatter; body: string } | null>  // body = raw MDX source
getPosts(): Promise<PostFrontmatter[]>          // excludes drafts in production, newest first
getPost(slug): Promise<{ meta: PostFrontmatter; body: string } | null>
getPortfolioData(): Promise<PortfolioData>      // serializable bundle for OS experiences
```

All functions are `async` (return Promises) from day one, even though today they read files at build time. A later DB-backed version can then replace their internals without any caller changing.

**Initial content** comes from the CV (`Abu Bin Oalid.pdf`): profile, skills (Backend, Frontend, Database, DevOps, Realtime, Architecture, AI-Assisted Development), 3 experience entries, 2 education entries, and 5 projects (6amMart, AjaxERP, Alhisab, Rebusel, GpsFreelancer). Blog starts with one seed post.

## 4. Architecture

```
src/
  app/
    (site)/                     # classic portfolio, indexed
      layout.tsx                # header, footer, theme provider, OS-suggest banner
      page.tsx                  # home: hero, about, skills, experience, projects, education, contact
      projects/page.tsx
      projects/[slug]/page.tsx  # case study (MDX)
      blog/page.tsx
      blog/[slug]/page.tsx
      resume/page.tsx           # printable resume + PDF download
    os/                         # OS experiences, noindex
      layout.tsx                # robots: noindex; full-viewport, no site chrome
      page.tsx                  # OS gallery / picker
      [os]/page.tsx             # resolves skin from registry, lazy-loads it
    sitemap.ts
    robots.ts
    opengraph-image.tsx
    layout.tsx                  # root: fonts, metadata base, JSON-LD
    not-found.tsx
  content/
    types.ts
    profile.ts  skills.ts  experience.ts  education.ts
    projects/*.mdx
    blog/*.mdx
  lib/
    content.ts                  # content layer (only reader of src/content)
    seo.ts                      # metadata + JSON-LD builders
    os-detect.ts                # pure detection function
    utils.ts
  components/
    site/                       # classic-site sections & layout pieces
    ui/                         # small shared primitives (Button, Badge, Card, ...)
    mdx/                        # MDX component map
  os/
    core/
      types.ts                  # OsId, OsSkin, AppId, AppDefinition
      registry.ts               # list of skins + lazy loaders
      apps/                     # SHARED app bodies (About, Projects, ...), skin-agnostic
      desktop/                  # desktop engine: window store, Window, drag/resize, focus
      mobile/                   # mobile engine: home screen, app stack, navigation
    skins/
      windows11/
      macos/
      iphone/
public/
  images/  resume/  os/<skin>/  (wallpapers, icons: original or properly licensed)
```

### Boundaries

- `src/content/**` is imported **only** by `src/lib/content.ts`.
- `src/components/site/**` never imports from `src/os/**`, and vice versa. Two exceptions: `OsSuggestBanner` imports only `os-detect.ts` and `registry` metadata (no skin code), and the OS Contact app reuses `components/site/contact-form.tsx`.
- Skins never import other skins. Skins import from `os/core/**` and `components/ui/**` only.
- App bodies in `os/core/apps/**` receive content via props (loaded server-side in `app/os/[os]/page.tsx` and passed down), so OS bundles do not ship the MDX pipeline.

## 5. Classic site

### Pages

| Route | Purpose | Rendering |
|---|---|---|
| `/` | Single-page overview: Hero → About → Skills → Experience → Featured Projects → Education → Contact | Static |
| `/projects` | All projects grid | Static |
| `/projects/[slug]` | Case study: problem, role, architecture, outcomes, metrics, screenshots, links | Static (`generateStaticParams`) |
| `/blog` | Post list | Static |
| `/blog/[slug]` | Post | Static |
| `/resume` | Print-friendly resume + PDF download | Static |

### Home sections

- **Hero:** name, title, "7+ years", tagline, availability pill, CTAs (*View projects*, *Download CV*, *Contact*), avatar. Subtle animated grid background (CSS only).
- **About:** summary paragraph + quick facts (location, years, focus areas).
- **Skills:** grouped chips. The AI-assisted group is shown separately.
- **Experience:** vertical timeline.
- **Featured projects:** cards with tech badges, metrics, and link to case study.
- **Education:** compact list.
- **Contact:** email, socials, contact form.

### Theme

- **Dark (default):** near-black background, one accent color, sans for body, mono for labels/code accents, subtle grid/noise details.
- **Light "minimal":** off-white, same layout, reduced decoration.
- Implemented with CSS variables under `[data-theme]` + `next-themes`. Toggle in the header. Default is always dark (system preference is not followed); the visitor's choice is remembered.
- Fonts via `next/font` (Geist Sans + Geist Mono), self-hosted with no layout shift.

### Contact form

- Server Action + `zod` validation + honeypot field.
- Sends email via Resend when `RESEND_API_KEY` is set. Otherwise the form is hidden and a `mailto:` button is shown instead.
- Returns typed success/error state. Rate limiting is deferred to the backend phase.

## 6. SEO

- `metadataBase`, per-page `generateMetadata` (title template `%s · Abu Bin Oalid`, description, canonical, Open Graph, Twitter card).
- JSON-LD: `Person` + `ProfilePage` on `/`, `CreativeWork` on project pages, `BlogPosting` on posts, and `BreadcrumbList` on detail pages.
- `sitemap.ts` built from the content layer (home, projects, posts, resume). `/os/*` is excluded.
- `robots.ts` allows everything except `/os/`. The `/os` layout also sets `robots: { index: false, follow: true }`.
- OG image generated with `next/og` (name, title, avatar).
- Semantic HTML: one `h1` per page, landmark elements, alt text on all images.
- Images via `next/image` with explicit sizes.
- Lighthouse CI gate on `/` and one project page (≥ 95 in all four categories).

## 7. OS detection and suggestion

`src/lib/os-detect.ts` exports a **pure** function:

```ts
type DetectInput = {
  userAgent: string;
  platform?: string;                 // navigator.userAgentData?.platform
  platformVersion?: string;          // from getHighEntropyValues(['platformVersion'])
  maxTouchPoints?: number;
};
function detectOs(input: DetectInput): DetectedOs   // 'windows11' | 'windows10' | 'windows' | 'macos' | 'iphone' | 'ipad' | 'android' | 'samsung' | 'linux' | 'unknown'
```

Rules:

- **iPhone:** UA contains `iPhone`.
- **iPad:** UA contains `iPad`, OR UA says `Macintosh` and `maxTouchPoints > 1`.
- **macOS:** `Macintosh` and not iPad.
- **Samsung:** `SamsungBrowser` or `SM-` model token. **Android:** `Android` otherwise.
- **Windows 11 vs 10:** Windows UA + `platformVersion` major ≥ 13 means `windows11`. Major 1–12 means `windows10`. Missing (Firefox/Safari) means `windows`.
- **Linux:** `Linux` and not Android.

The mapping from detected OS to a suggested skin lives in the registry: `windows11|windows → windows11`, `windows10 → windows11` until a win10 skin exists, `macos → macos`, `iphone → iphone`, `ipad → macos`. Anything with no skin gets no banner.

**`OsSuggestBanner`** (client component in the site layout):

- Runs after hydration (`useEffect`), so server HTML is identical for all visitors and bots.
- Shows the copy "You're on {OS name}. View this portfolio as {OS name}?" with buttons *Open* and *Not now*.
- Dismissal is stored in `localStorage` (`os-suggest-dismissed`), wrapped in try/catch.
- Hidden on `/os/*`, with `prefers-reduced-motion` respected for its entrance animation.
- The footer always has an **"Explore OS versions"** link to `/os` for everyone.

## 8. OS experiences

### Shared model

```ts
type OsId = 'windows11' | 'macos' | 'iphone';      // grows over time
type OsKind = 'desktop' | 'mobile';

type OsSkin = {
  id: OsId;
  name: string;                 // "Windows 11"
  kind: OsKind;
  status: 'ready' | 'coming-soon';
  thumbnail: string;
};
// Loaders live in a separate module (os/core/loaders.ts) so code that only needs
// metadata (e.g. the suggestion banner) never pulls skin chunks:
// skinLoaders: Record<OsId, () => Promise<{ default: ComponentType<OsRootProps> }>>

type AppId = 'about' | 'projects' | 'experience' | 'skills' | 'resume' | 'contact' | 'terminal' | 'browser';

type OsRootProps = { data: PortfolioData };  // everything from the content layer, serialized
```

`app/os/[os]/page.tsx` is a server component. It validates the param against the registry (otherwise `notFound()`), loads `PortfolioData` from the content layer, and renders a client `OsHost` that `React.lazy`-loads the skin. Each skin is therefore its own JS chunk.

### Shared apps (`os/core/apps`)

Each app is a skin-agnostic React component that renders content from `PortfolioData`. Skins style them via CSS variables (`--os-font`, `--os-bg`, `--os-fg`, `--os-accent`, `--os-radius`).

| App | Content |
|---|---|
| About | Profile + summary + avatar |
| Projects | Project list → detail (summary, tech, metrics, links, plus a link to the full classic case study) |
| Experience | Timeline |
| Skills | Grouped skills |
| Resume | Embedded PDF viewer + download |
| Contact | Email/socials + the same contact Server Action |
| Terminal | Fake shell: `help`, `whoami`, `ls projects`, `cat about.txt`, `open <app>`, `skills`, `contact`, `exit` (back to classic), `clear` |
| Browser | Reads the blog list and links out to classic blog posts |

### Desktop engine (`os/core/desktop`)

- **Window store** (Zustand): `windows: { id, appId, title, x, y, w, h, z, state: 'normal'|'minimized'|'maximized' }[]`, `focusedId`. Actions: `open(appId)` (focuses if already open), `close`, `focus`, `minimize`, `toggleMaximize`, `move`, `resize`.
- **`<Window>`**: drag by title bar, resize from edges, double-click title to maximize, focus on pointer-down. Uses pointer events and is clamped to the viewport. Skins provide the **chrome** (title bar, buttons) through a render prop / slot. The engine owns behavior.
- **Desktop icons**: double-click (or Enter) opens the app.
- **Keyboard:** Esc closes menus; windows are focusable; `Alt+F4` / `Cmd+W` close the focused window (best effort; don't fight the browser).
- On small viewports (< 768px) a desktop skin shows a notice offering the mobile skin or classic view.

### Mobile engine (`os/core/mobile`)

- Home screen grid of app icons + dock, status bar (time, battery glyph).
- Opening an app pushes a full-screen view with an open animation. A swipe from the bottom edge or the home indicator goes home. There's a back button inside apps.
- On wide viewports the phone is rendered inside a device frame, centered.

### v1 skins

| Skin | Kind | Chrome |
|---|---|---|
| Windows 11 | desktop | Centered taskbar, Start menu (pinned apps + "Back to classic view"), Mica-like translucent windows with rounded corners, min/max/close on the right, system tray clock |
| macOS | desktop | Top menu bar (Apple-style menu → "Back to classic view", "About this portfolio"), Dock with magnification, traffic-light buttons on the left, translucent sidebar windows |
| iPhone | mobile | iOS-style status bar, Dynamic Island shape, home screen + dock, app open/close zoom animation, home indicator |

Every skin includes an always-reachable **"Back to classic"** entry and an **OS switcher** (listing all registry skins, with "coming soon" ones disabled).

Optional per-skin **boot screen** (≤ 1.5s, skippable, skipped entirely with `prefers-reduced-motion` or on repeat visit in the same session).

### Legal / assets

OS logos, wallpapers, and system fonts are trademarked or copyrighted. Skins use **original or freely licensed** wallpapers and icons (e.g. Fluent/Lucide-style open icon sets) and approximate system fonts via open fonts (e.g. Inter or Segoe-like fallbacks using `system-ui`). The `/os` page footer reads: *"Fan-made recreations for a personal portfolio. Not affiliated with Microsoft, Apple, Samsung, or Canonical."*

## 9. Performance and accessibility

- Classic site ships no OS code. This is verified by inspecting the build output in CI (`/` first-load JS budget ≤ 160 kB gzip (raised from 120: Next 16 framework floor ≈135 kB)).
- OS skins are lazy-loaded per route. Wallpapers use `next/image` / AVIF.
- All interactive OS elements are real buttons with labels. Windows have `role="dialog"` + `aria-label`. Focus moves into newly opened windows.
- `prefers-reduced-motion` disables non-essential animation everywhere.
- Classic site meets WCAG 2.2 AA contrast in both themes.

## 10. Testing

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | `detectOs` (UA table incl. edge cases), content layer (sorting, drafts, slug lookup), window store reducer logic, terminal command parser |
| Component | Vitest + React Testing Library | OsSuggestBanner (shows/hides/dismiss), Window (open/focus/close), contact form validation states |
| E2E | Playwright | Home renders all sections; project page renders; theme toggle persists; banner appears with spoofed Mac UA; `/os/windows11` opens and closes an app window; `/os/iphone` opens an app and returns home; `/os/*` has `noindex` meta |
| Quality | Lighthouse CI, `next build`, ESLint, `tsc --noEmit` | Run in GitHub Actions on every push / PR |

## 11. Phasing

1. **Foundation:** Next.js scaffold, tooling, CI, content model + CV content, content layer.
2. **Classic site:** layout, theme, all home sections, project & blog pages, resume page.
3. **SEO:** metadata, JSON-LD, sitemap, robots, OG image, Lighthouse gate.
4. **Contact form**.
5. **OS core:** detection, banner, registry, `/os` gallery, `[os]` host, shared apps.
6. **Desktop engine + Windows 11 skin**.
7. **macOS skin**.
8. **Mobile engine + iPhone skin**.
9. **Polish & launch:** a11y pass, performance budget, deploy to Vercel, custom domain, Google Search Console.

**Later (separate specs):** Windows 10 / 7 / XP, Ubuntu, Samsung/Android skins; backend phase (DB, admin, view counter, rate-limited contact); testimonials.

## 12. Inputs needed from the owner

- Project screenshots and, where possible, real metrics per project.
- Current availability status (CV's 6amTech role ends March 2026).
- Preferred domain name.
- Resend account / API key for the contact form (optional; mailto fallback works without it).
- Any certifications, testimonials, or blog post ideas.
