import { expect, type Page, test } from '@playwright/test';

// Runs in both projects: chromium (1440px, device frame) and mobile-safari (phone-sized, full-screen).

const home = (page: Page) => page.getByRole('list', { name: 'Home screen' });
const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' });
const navBar = (page: Page) => page.getByRole('navigation', { name: 'Navigation bar' });
const appScreen = (page: Page, name: string) => page.getByRole('region', { name });

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-samsung', '1');
    } catch {
      /* ignore */
    }
  });

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/samsung');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-samsung'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(home(page)).toBeVisible();
});

test.describe('booted', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/samsung');
    await expect(home(page)).toBeVisible();
  });

  test('shows the status bar, punch-hole, labelled home grid, dock and nav bar', async ({ page }) => {
    await expect(page.locator('[data-os-skin="samsung"]')).toBeVisible();
    await expect(page.locator('[data-mobile="status-bar"] time')).toHaveText(/^\d{1,2}[:.]\d{2}$/);
    await expect(page.getByTestId('punch-hole')).toBeVisible();
    for (const name of ['Experience', 'Skills', 'Resume', 'Browser', 'Switch OS']) {
      await expect(home(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
    for (const name of ['About', 'Projects', 'Contact', 'Terminal']) {
      await expect(dock(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
    for (const name of ['Recents', 'Go home', 'Back']) {
      await expect(navBar(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('the app view has a large-title heading in the top band; Go home returns to the grid', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'About' }).click();
    const about = appScreen(page, 'About');
    await expect(about.getByText('Abu Bin Oalid').first()).toBeVisible();
    const title = about.getByRole('heading', { level: 1, name: 'About' });
    await expect(title).toBeVisible();
    const box = await title.boundingBox();
    const screenBox = await page.getByTestId('device-screen').boundingBox();
    if (!box || !screenBox) throw new Error('no geometry');
    // The title sits low in the band that fills the top ~30% of the screen.
    const titleBottom = (box.y + box.height - screenBox.y) / screenBox.height;
    expect(titleBottom).toBeGreaterThan(0.18);
    expect(titleBottom).toBeLessThan(0.35);
    await navBar(page).getByRole('button', { name: 'Go home' }).click();
    await expect(about).toHaveCount(0);
    await expect(home(page).getByRole('button', { name: 'Skills' })).toBeVisible();
  });

  test('the nav-bar Back and the header up arrow both leave an app; Recents does nothing', async ({ page }) => {
    await home(page).getByRole('button', { name: 'Skills' }).click();
    const skills = appScreen(page, 'Skills');
    await navBar(page).getByRole('button', { name: 'Recents' }).click();
    await expect(skills).toBeVisible();
    await navBar(page).getByRole('button', { name: 'Back' }).click();
    await expect(skills).toHaveCount(0);
    await home(page).getByRole('button', { name: 'Skills' }).click();
    await appScreen(page, 'Skills').getByRole('button', { name: 'Navigate up' }).click();
    await expect(appScreen(page, 'Skills')).toHaveCount(0);
    // Back on the home screen is a no-op.
    await navBar(page).getByRole('button', { name: 'Back' }).click();
    await expect(home(page).getByRole('button', { name: 'Skills' })).toBeVisible();
  });

  test('Browser keeps its Blog heading under the large title', async ({ page }) => {
    await home(page).getByRole('button', { name: 'Browser' }).click();
    const browser = appScreen(page, 'Browser');
    await expect(browser.getByRole('heading', { level: 1, name: 'Browser' })).toBeVisible();
    await expect(browser.getByRole('heading', { level: 2, name: 'Blog' })).toBeVisible();
    await expect(browser.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('Projects opens a detail view from a card', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Projects' }).click();
    const projects = appScreen(page, 'Projects');
    await expect(projects.getByRole('heading', { level: 1 })).toHaveText('Projects');
    await projects.locator('.os-card').first().click();
    await expect(projects.getByRole('button', { name: '← All projects' })).toBeVisible();
  });

  test('Terminal `open skills` switches to the Skills app', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Terminal' }).click();
    const input = appScreen(page, 'Terminal').getByRole('textbox');
    await input.fill('open skills');
    await input.press('Enter');
    await expect(appScreen(page, 'Skills')).toBeVisible();
    await expect(appScreen(page, 'Terminal')).toHaveCount(0);
  });

  test('Switch OS lists every skin and the classic view', async ({ page }) => {
    await home(page).getByRole('button', { name: 'Switch OS' }).click();
    const app = appScreen(page, 'Switch OS');
    const nav = app.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'Samsung One UI' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'iPhone' })).toHaveAttribute('href', '/os/iphone');
    await expect(nav.getByRole('link')).toHaveCount(8);
    await expect(app.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');
  });

  test('a swipe up from the bottom edge goes home', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Projects' }).click();
    const projects = appScreen(page, 'Projects');
    await expect(projects).toBeVisible();
    const box = await page.getByTestId('device-screen').boundingBox();
    if (!box) throw new Error('no device screen');
    const x = box.x + box.width / 4; // beside the nav-bar buttons' centres
    await page.mouse.move(x, box.y + box.height - 6);
    await page.mouse.down();
    await page.mouse.move(x, box.y + box.height - 60, { steps: 4 });
    await page.mouse.move(x, box.y + box.height - 200, { steps: 4 });
    await page.mouse.up();
    await expect(projects).toHaveCount(0);
  });

  test('device frame on wide screens, full-screen on phones', async ({ page, isMobile }) => {
    const screenEl = page.getByTestId('device-screen');
    await expect(screenEl).toBeVisible();
    const box = await screenEl.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error('no geometry');
    if (isMobile) {
      expect(box.width).toBe(viewport.width);
      expect(box.height).toBe(viewport.height);
    } else {
      await expect(page.getByTestId('device-frame')).toBeVisible();
      expect(Math.round(box.width)).toBe(390);
      expect(Math.round(box.height)).toBe(844);
      expect(Math.round(box.x + box.width / 2)).toBe(viewport.width / 2);
    }
  });
});
