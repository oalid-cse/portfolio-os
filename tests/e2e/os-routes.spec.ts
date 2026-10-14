import { expect, test } from '@playwright/test';

test('/os/windows11 is noindex and renders the skin', async ({ page, isMobile }) => {
  await page.addInitScript(() => sessionStorage.setItem('os-booted-windows11', '1'));
  await page.goto('/os/windows11');
  await expect(page.locator('meta[name=robots][content*=noindex]')).toHaveCount(1);
  await expect(page.locator('[data-os-skin="windows11"]')).toBeVisible();
  // Desktop: the way back lives in the Start menu. Phones get the small-screen notice instead.
  if (!isMobile) await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByRole('link', { name: 'Back to classic view' })).toBeVisible();
});

test('/os/ubuntu is a 404', async ({ page }) => {
  const res = await page.goto('/os/ubuntu');
  expect(res?.status()).toBe(404);
});

test('/os shows the disclaimer, tiles and back link', async ({ page }) => {
  await page.goto('/os');
  await expect(
    page.getByText(
      'Fan-made recreations for a personal portfolio. Not affiliated with Microsoft, Apple, Samsung, or Canonical.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open' })).toHaveCount(3);
  await expect(page.getByText('Coming soon')).toHaveCount(5);
  await page.getByRole('link', { name: 'Back to classic view' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('no JavaScript or HTML loaded on / contains skin code', async ({ page }) => {
  const scripts: Promise<string>[] = [];
  page.on('response', (res) => {
    const type = res.headers()['content-type'] ?? '';
    if (res.url().includes('.js') || type.includes('text/html')) scripts.push(res.text().catch(() => ''));
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const bodies = await Promise.all(scripts);
  expect(bodies.length).toBeGreaterThan(0);
  for (const body of bodies) expect(body).not.toContain('data-os-skin');
});
