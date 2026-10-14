import { expect, type Page, test } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'Windows 10 is a desktop skin');

const APPS = ['About', 'Projects', 'Experience', 'Skills', 'Resume', 'Contact', 'Terminal', 'Browser'];

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-windows10', '1');
    } catch {
      /* ignore */
    }
  });

const taskbar = (page: Page) => page.getByRole('navigation', { name: 'Taskbar' });
const startMenu = (page: Page) => page.getByRole('dialog', { name: 'Start' });

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/windows10');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-windows10'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(taskbar(page)).toBeVisible();
});

test.describe('after boot', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/windows10');
    await expect(taskbar(page)).toBeVisible();
    await expect(page.getByTestId('boot-screen')).toHaveCount(0);
  });

  test('the taskbar has Start, search, pinned apps and a clock', async ({ page }) => {
    const bar = taskbar(page);
    await expect(page.locator('[data-os-skin="windows10"]')).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Start' })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Type here to search' })).toBeVisible();
    await expect(bar.getByRole('textbox')).toHaveCount(0);
    for (const name of ['About', 'Projects', 'Terminal', 'Browser']) {
      await expect(bar.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(bar.locator('time')).toHaveText(/\d/);
  });

  test('Start menu lists every app, the tiles, Switch OS and the way back', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    const menu = startMenu(page);
    await expect(menu).toBeVisible();
    const list = menu.getByRole('list', { name: 'All apps' });
    const tiles = menu.getByRole('list', { name: 'Tiles' });
    for (const name of APPS) {
      await expect(list.getByRole('button', { name, exact: true })).toBeVisible();
      await expect(tiles.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(menu).toContainText('Abu Bin Oalid');
    await expect(menu.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');

    await menu.getByRole('button', { name: 'Switch OS' }).click();
    const nav = page.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'Windows 10' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Windows 11' })).toHaveAttribute('href', '/os/windows11');

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('the search box opens the Start menu', async ({ page }) => {
    await taskbar(page).getByRole('button', { name: 'Type here to search' }).click();
    await expect(startMenu(page)).toBeVisible();
  });

  test('About opens from a Start tile, minimizes via the taskbar and restores', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await startMenu(page).getByRole('list', { name: 'Tiles' }).getByRole('button', { name: 'About' }).click();
    await expect(startMenu(page)).toBeHidden();
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(about).toContainText('Abu Bin Oalid');

    const task = taskbar(page).getByRole('button', { name: 'About', exact: true });
    await task.click();
    await expect(about).toBeHidden();
    await task.click();
    await expect(about).toBeVisible();
  });

  test('window chrome maximizes, restores and closes; Alt+F4 closes too', async ({ page }) => {
    await taskbar(page).getByRole('button', { name: 'Skills' }).click();
    const skills = page.getByRole('dialog', { name: 'Skills' });
    await skills.getByRole('button', { name: 'Maximize' }).click();
    await expect(skills.getByRole('button', { name: 'Restore' })).toBeVisible();
    await skills.getByRole('button', { name: 'Close' }).click();
    await expect(skills).toHaveCount(0);

    await taskbar(page).getByRole('button', { name: 'Projects' }).click();
    const projects = page.getByRole('dialog', { name: 'Projects' });
    await expect(projects).toBeVisible();
    await page.keyboard.press('Alt+F4');
    await expect(projects).toHaveCount(0);
  });

  test('Back to classic view returns to the classic site', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await startMenu(page).getByRole('link', { name: 'Back to classic view' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
