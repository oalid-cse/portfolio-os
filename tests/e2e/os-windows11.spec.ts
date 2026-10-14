import { expect, type Page, test } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'Windows 11 is a desktop skin');

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-windows11', '1');
    } catch {
      /* ignore */
    }
  });

const taskbar = (page: Page) => page.getByRole('navigation', { name: 'Taskbar' });

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  // Drive time by hand so the 1.2s boot timer cannot beat the click on a slow machine.
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/windows11');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-windows11'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(taskbar(page)).toBeVisible();
});

test.describe('after boot', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/windows11');
    await expect(taskbar(page)).toBeVisible();
    await expect(page.getByTestId('boot-screen')).toHaveCount(0);
  });

  test('Start menu shows pinned apps and the way back to the classic view', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    const menu = page.getByRole('dialog', { name: 'Start' });
    await expect(menu).toBeVisible();
    for (const name of ['About', 'Projects', 'Experience', 'Skills', 'Resume', 'Contact', 'Terminal', 'Browser']) {
      await expect(menu.getByRole('button', { name, exact: true })).toBeVisible();
    }
    await expect(menu.getByRole('link', { name: 'Back to classic view' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('Switch OS lists the other skins', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Switch OS' }).click();
    const nav = page.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'Windows 11' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'macOS' })).toHaveAttribute('href', '/os/macos');
  });

  test('About opens from Start, minimizes via the taskbar and restores', async ({ page }) => {
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('dialog', { name: 'Start' }).getByRole('button', { name: 'About', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Start' })).toBeHidden();
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(about).toContainText('Abu Bin Oalid');

    const task = taskbar(page).getByRole('button', { name: 'About' });
    await task.click();
    await expect(about).toBeHidden();
    await task.click();
    await expect(about).toBeVisible();
  });

  test('the Terminal command `open projects` opens a Projects window', async ({ page }) => {
    await taskbar(page).getByRole('button', { name: 'Terminal' }).click();
    const terminal = page.getByRole('dialog', { name: 'Terminal' });
    await expect(terminal).toBeVisible();
    const input = terminal.getByRole('textbox');
    await input.fill('open projects');
    await input.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Projects' })).toBeVisible();
  });

  test('window chrome maximizes and closes', async ({ page }) => {
    await taskbar(page).getByRole('button', { name: 'Skills' }).click();
    const win = page.getByRole('dialog', { name: 'Skills' });
    await win.getByRole('button', { name: 'Maximize' }).click();
    await expect(win.getByRole('button', { name: 'Restore' })).toBeVisible();
    await win.getByRole('button', { name: 'Close' }).click();
    await expect(win).toHaveCount(0);
  });

  test('the tray shows a clock', async ({ page }) => {
    await expect(taskbar(page).locator('time')).toHaveText(/\d/);
  });
});
