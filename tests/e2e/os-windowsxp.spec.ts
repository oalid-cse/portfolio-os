import { expect, type Page, test } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'Windows XP is a desktop skin');

const APPS = ['About', 'Projects', 'Experience', 'Skills', 'Resume', 'Contact', 'Terminal', 'Browser'];

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-windowsxp', '1');
    } catch {
      /* ignore */
    }
  });

const taskbar = (page: Page) => page.getByRole('navigation', { name: 'Taskbar' });
const quickLaunch = (page: Page) => taskbar(page).getByRole('group', { name: 'Quick Launch' });
const openWindows = (page: Page) => taskbar(page).getByRole('list', { name: 'Open windows' });
const startMenu = (page: Page) => page.getByRole('dialog', { name: 'Start' });
const allApps = (page: Page) => startMenu(page).getByRole('list', { name: 'All apps' });

const launchFromStart = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'Start' }).click();
  await allApps(page).getByRole('button', { name, exact: true }).click();
};

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/windowsxp');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await expect(boot).toContainText('Portfolio');
  await expect(boot).toContainText('XP');
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-windowsxp'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(taskbar(page)).toBeVisible();
});

test.describe('after boot', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/windowsxp');
    await expect(taskbar(page)).toBeVisible();
    await expect(page.getByTestId('boot-screen')).toHaveCount(0);
  });

  test('the taskbar has the green start button, quick launch, window buttons and a clock', async ({ page }) => {
    const bar = taskbar(page);
    await expect(page.locator('[data-os-skin="windowsxp"]')).toBeVisible();
    const start = bar.getByRole('button', { name: 'Start' });
    await expect(start).toBeVisible();
    await expect(start).toContainText('start');
    expect((await bar.boundingBox())?.height).toBe(30);
    for (const name of ['About', 'Projects', 'Contact', 'Terminal']) {
      await expect(quickLaunch(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(openWindows(page).getByRole('button')).toHaveCount(0);
    await expect(bar.locator('time')).toHaveText(/\d/);
  });

  test('Start menu lists every app, the user, Switch OS and the way back', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    const menu = startMenu(page);
    await expect(menu).toBeVisible();
    for (const name of APPS) {
      await expect(allApps(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(allApps(page).getByRole('button', { name: 'About', exact: true })).toBeFocused();
    await expect(menu).toContainText('Abu Bin Oalid');
    await expect(menu.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');

    await menu.getByRole('button', { name: 'Switch OS' }).click();
    const nav = page.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'Windows XP' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Windows 7' })).toHaveAttribute('href', '/os/windows7');

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Start' })).toBeFocused();
  });

  test('a click outside or Close menu dismisses the Start menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(startMenu(page)).toBeVisible();
    await page.mouse.click(900, 300);
    await expect(startMenu(page)).toBeHidden();

    await page.getByRole('button', { name: 'Start' }).click();
    await startMenu(page).getByRole('button', { name: 'Close menu' }).click();
    await expect(startMenu(page)).toBeHidden();
  });

  test('About opens from the Start menu on a beige body, minimizes via its window button and restores', async ({ page }) => {
    await launchFromStart(page, 'About');
    await expect(startMenu(page)).toBeHidden();
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(about).toContainText('Abu Bin Oalid');
    await expect(about.locator('.os-app').first()).toHaveCSS('background-color', 'rgb(236, 233, 216)');

    const task = openWindows(page).getByRole('button', { name: 'About' });
    await expect(task).toHaveAttribute('aria-pressed', 'true');
    await task.click();
    await expect(about).toBeHidden();
    await task.click();
    await expect(about).toBeVisible();
  });

  test('quick launch opens apps; window chrome maximizes, restores and closes; Alt+F4 closes too', async ({ page }) => {
    await quickLaunch(page).getByRole('button', { name: 'Projects' }).click();
    const projects = page.getByRole('dialog', { name: 'Projects' });
    await projects.getByRole('button', { name: 'Maximize' }).click();
    await expect(projects.getByRole('button', { name: 'Restore' })).toBeVisible();
    await projects.getByRole('button', { name: 'Close' }).click();
    await expect(projects).toHaveCount(0);

    await launchFromStart(page, 'Skills');
    const skills = page.getByRole('dialog', { name: 'Skills' });
    await expect(skills).toBeVisible();
    await page.keyboard.press('Alt+F4');
    await expect(skills).toHaveCount(0);
  });

  test('a desktop icon opens its app on double-click', async ({ page }) => {
    await page.getByRole('button', { name: 'Resume', pressed: false }).first().dblclick();
    await expect(page.getByRole('dialog', { name: 'Resume' })).toBeVisible();
  });

  test('Back to classic view returns to the classic site', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await startMenu(page).getByRole('link', { name: 'Back to classic view' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
