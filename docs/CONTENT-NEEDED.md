# Content needed from Abu Bin Oalid

The site is built with **demo/placeholder content** where real info was missing.
Search the code for `TODO(owner)` to find every placeholder. Replace them, then tick the box.

## Profile
- [ ] Current availability: `open` / `freelance` / `not-looking` (CV shows 6amTech role ended March 2026) — `src/content/profile.ts`
- [ ] Hero tagline wording (demo: "I design scalable, multi-tenant backend systems with PHP & Laravel.") — `src/content/profile.ts`
- [ ] Final domain name (demo: `https://abubinoalid.dev`) — set `NEXT_PUBLIC_SITE_URL` in Vercel

## Projects (`src/content/projects/*.mdx`)
For each of 6amMart, AjaxERP, Alhisab, Rebusel, GpsFreelancer:
- [ ] Your role and year
- [ ] 2–4 screenshots (put them in `public/images/projects/<slug>/`)
- [ ] Real metrics (e.g. "Report time: 8s → 1.2s", "Vendors: 1,200+")
- [ ] 6amMart CodeCanyon URL
- [ ] GitHub links (if any are public)

## Optional
- [ ] Certifications
- [ ] Testimonials (name, role, company, quote)
- [ ] Blog post ideas / first real post (`src/content/blog/`)
- [ ] Resend API key + receiving email for the contact form (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`)
