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

test('a fresh load of /os/windows11 never shows the loader once the skin has appeared', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('os-booted-windows11', '1');
    // Record, from the very first parse, whether the loader ever shows up after the skin root did.
    const w = window as unknown as { __loaderAfterSkin?: boolean };
    let skinSeen = false;
    new MutationObserver(() => {
      if (document.querySelector('[data-os-skin]')) skinSeen = true;
      const loading = [...document.querySelectorAll('[role="status"]')].some((el) => el.textContent?.includes('Loading'));
      if (skinSeen && loading) w.__loaderAfterSkin = true;
    }).observe(document, { subtree: true, childList: true });
  });
  await page.goto('/os/windows11', { waitUntil: 'commit' });
  await expect(page.locator('[data-os-skin]')).toBeAttached();
  const loader = page.getByRole('status').filter({ hasText: 'Loading' });
  // Poll for ~1s across hydration: the loader must never be visible again.
  for (let i = 0; i < 20; i++) {
    expect(await loader.isVisible()).toBe(false);
    await page.waitForTimeout(50);
  }
  expect(await page.evaluate(() => (window as unknown as { __loaderAfterSkin?: boolean }).__loaderAfterSkin)).toBeUndefined();
});

test('a skin chunk that fails to load shows a recoverable error', async ({ page, isMobile }) => {
  test.skip(isMobile, 'one engine is enough for the error boundary');
  await page.addInitScript(() => sessionStorage.setItem('os-booted-windows11', '1'));
  // Fail the lazily loaded skin chunk (the only script that renders the skin root) until Retry.
  let failSkin = true;
  await page.route('**/_next/static/chunks/*.js', async (route) => {
    if (!failSkin) return route.continue();
    const res = await route.fetch();
    const body = await res.text();
    if (body.includes('data-os-skin')) return route.abort();
    return route.fulfill({ response: res, body });
  });
  await page.goto('/os/windows11');
  await expect(page.getByRole('heading', { name: "Couldn't load this OS." })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');
  failSkin = false;
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('[data-os-skin="windows11"]')).toBeVisible();
});

test('an unknown OS id is a 404', async ({ page }) => {
  const res = await page.goto('/os/beos');
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
  await expect(page.getByRole('link', { name: 'Open' })).toHaveCount(8);
  await expect(page.getByText('Coming soon')).toHaveCount(0);
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
