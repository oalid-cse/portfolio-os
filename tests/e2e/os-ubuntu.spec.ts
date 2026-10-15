import { expect, type Page, test } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'Ubuntu is a desktop skin');

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-ubuntu', '1');
    } catch {
      /* ignore */
    }
  });

const topBar = (page: Page) => page.getByRole('region', { name: 'Top bar' });
const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' });
const overview = (page: Page) => page.getByRole('group', { name: 'Activities overview' });
const APPS = ['About', 'Projects', 'Experience', 'Skills', 'Resume', 'Contact', 'Terminal', 'Browser'];

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/ubuntu');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-ubuntu'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(dock(page)).toBeVisible();
});

const ubuntuFaces = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => /Ubuntu/.test(f.family) && !/Fallback/.test(f.family)).map((f) => f.status);
  });

test('the Ubuntu web font is loaded by this skin only, never by the classic site', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(await ubuntuFaces(page)).toEqual([]);

  await markBooted(page);
  await page.goto('/os/ubuntu');
  await expect(dock(page)).toBeVisible();
  await expect.poll(async () => (await ubuntuFaces(page)).includes('loaded')).toBe(true);
});

test.describe('after boot', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/ubuntu');
    await expect(dock(page)).toBeVisible();
    await expect(page.getByTestId('boot-screen')).toHaveCount(0);
  });

  test('Activities points at the overview only while it is open', async ({ page }) => {
    const activities = topBar(page).getByRole('button', { name: 'Activities' });
    await expect(activities).not.toHaveAttribute('aria-controls');
    await activities.click();
    const id = await overview(page).getAttribute('id');
    expect(id).toBeTruthy();
    await expect(activities).toHaveAttribute('aria-controls', id!);
    await expect(dock(page).getByRole('button', { name: 'Show apps' })).toHaveAttribute('aria-controls', id!);
  });

  test('the dock scrolls on a short window, so every app stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 420 });
    await dock(page).getByRole('button', { name: 'Browser' }).click();
    await expect(page.getByRole('dialog', { name: 'Browser' })).toBeVisible();
  });

  test('the top bar shows Activities and a GNOME-style clock', async ({ page }) => {
    await expect(topBar(page).getByRole('button', { name: 'Activities' })).toBeVisible();
    await expect(topBar(page).locator('time')).toHaveText(/^[A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2} \d{2}:\d{2}$/);
  });

  test('Activities opens the overview with every app, Switch OS and the classic view', async ({ page }) => {
    const activities = page.getByRole('button', { name: 'Activities' });
    await activities.click();
    await expect(activities).toHaveAttribute('aria-expanded', 'true');
    for (const name of APPS) await expect(overview(page).getByRole('button', { name, exact: true })).toBeVisible();
    await expect(overview(page).getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');

    await overview(page).getByRole('button', { name: 'Switch OS' }).click();
    const nav = page.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'Ubuntu' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Windows 11' })).toHaveAttribute('href', '/os/windows11');

    await page.keyboard.press('Escape');
    await expect(overview(page)).toBeHidden();
    await expect(activities).toBeFocused();
  });

  test('Show apps opens the overview; launching an app closes it and opens the window', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Show apps' }).click();
    await expect(overview(page)).toBeVisible();
    await overview(page).getByRole('button', { name: 'Skills', exact: true }).click();
    await expect(overview(page)).toBeHidden();
    await expect(page.getByRole('dialog', { name: 'Skills' })).toBeVisible();
  });

  test('the overview closes on an outside click', async ({ page }) => {
    await page.getByRole('button', { name: 'Activities' }).click();
    await expect(overview(page)).toBeVisible();
    await page.mouse.click(1300, 120); // empty overview backdrop
    await expect(overview(page)).toBeHidden();
  });

  test('the dock lists every app; clicks open, raise and restore but never minimize', async ({ page }) => {
    for (const name of APPS) await expect(dock(page).getByRole('button', { name, exact: true })).toBeVisible();
    const item = dock(page).getByRole('button', { name: 'Projects' });
    await item.click();
    const win = page.getByRole('dialog', { name: 'Projects' });
    await expect(win).toBeVisible();
    await item.click();
    await expect(win).toBeVisible();
    await win.getByRole('button', { name: 'Minimize' }).click();
    await expect(win).toBeHidden();
    await item.click();
    await expect(win).toBeVisible();
    await win.getByRole('button', { name: 'Close' }).click();
    await expect(win).toHaveCount(0);
  });

  test('maximize fills the work area beside the dock and below the top bar', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Resume' }).click();
    const win = page.getByRole('dialog', { name: 'Resume' });
    await win.getByRole('button', { name: 'Maximize' }).click();
    await expect(async () => {
      const box = await win.boundingBox();
      expect(box).toMatchObject({ x: 64, y: 32, width: 1440 - 64, height: 900 - 32 });
    }).toPass();
    await expect(win.getByRole('button', { name: 'Restore' })).toBeVisible();
  });

  test('Alt+F4 closes the focused window', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Contact' }).click();
    const win = page.getByRole('dialog', { name: 'Contact' });
    await expect(win).toBeVisible();
    await win.click({ position: { x: 200, y: 20 } });
    await page.keyboard.press('Alt+F4');
    await expect(win).toHaveCount(0);
  });
});
