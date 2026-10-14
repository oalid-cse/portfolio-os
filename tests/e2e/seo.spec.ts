import { expect, test } from '@playwright/test';

test('home has title, description, canonical and Person JSON-LD', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Abu Bin Oalid · Senior Backend Engineer');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /.+/);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /^https?:\/\/.+/);
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = raw.flatMap((r) => {
    const d = JSON.parse(r) as { '@type'?: string | string[] };
    return d['@type'] ?? [];
  });
  expect(types.flat()).toContain('Person');
});

test('project page title uses the template', async ({ page }) => {
  await page.goto('/projects/alhisab');
  await expect(page).toHaveTitle('Alhisab · Abu Bin Oalid');
});

test('robots.txt and sitemap.xml are served', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /os/');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/projects/alhisab');
  expect(sitemap).not.toContain('/os');
});
