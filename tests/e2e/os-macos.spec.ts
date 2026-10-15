import { expect, type Page, test } from '@playwright/test';

test.skip(({ isMobile }) => isMobile, 'macOS is a desktop skin');

const markBooted = (page: Page) =>
  page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-macos', '1');
    } catch {
      /* ignore */
    }
  });

const menuBar = (page: Page) => page.getByRole('region', { name: 'Menu bar' });
const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' });

test('first visit shows the boot screen, which a click skips', async ({ page }) => {
  const t0 = new Date('2026-10-15T09:00:00');
  await page.clock.install({ time: t0 });
  await page.clock.pauseAt(new Date(t0.getTime() + 1));
  await page.goto('/os/macos');
  const boot = page.getByTestId('boot-screen');
  await expect(async () => {
    await page.clock.runFor(20);
    expect(await boot.count()).toBe(1);
  }).toPass({ intervals: [25] });
  await expect(boot).toBeVisible();
  await boot.click();
  expect(await page.evaluate(() => sessionStorage.getItem('os-booted-macos'))).toBe('1');
  await page.clock.runFor(500); // fade-out
  await expect(boot).toBeHidden();
  await expect(dock(page)).toBeVisible();
});

test.describe('after boot', () => {
  test.beforeEach(async ({ page }) => {
    await markBooted(page);
    await page.goto('/os/macos');
    await expect(dock(page)).toBeVisible();
    await expect(page.getByTestId('boot-screen')).toHaveCount(0);
  });

  test('the menu bar shows a clock and the default title', async ({ page }) => {
    await expect(menuBar(page)).toBeVisible();
    await expect(menuBar(page).locator('time')).toHaveText(/\d/);
    await expect(menuBar(page).getByTestId('active-app')).toHaveText('Portfolio');
  });

  test('the system menu offers About, Switch OS and the classic view', async ({ page }) => {
    const button = page.getByRole('button', { name: 'System menu' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('group', { name: 'System menu' });
    await expect(menu.getByRole('button', { name: 'About this portfolio' })).toBeVisible();
    await expect(menu.getByRole('button', { name: 'Switch OS…' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Back to classic view' })).toHaveAttribute('href', '/');

    await menu.getByRole('button', { name: 'Switch OS…' }).click();
    const nav = page.getByRole('navigation', { name: 'Switch OS version' });
    await expect(nav.getByRole('link', { name: 'macOS' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Windows 11' })).toHaveAttribute('href', '/os/windows11');

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the system menu moves between items with the arrow keys', async ({ page }) => {
    await page.getByRole('button', { name: 'System menu' }).focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('group', { name: 'System menu' });
    const about = menu.getByRole('button', { name: 'About this portfolio' });
    const switchOs = menu.getByRole('button', { name: 'Switch OS…' });
    const classic = menu.getByRole('link', { name: 'Back to classic view' });
    await expect(about).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(switchOs).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(classic).toBeFocused();
    await page.keyboard.press('ArrowDown'); // wraps
    await expect(about).toBeFocused();
    await page.keyboard.press('ArrowUp'); // wraps back
    await expect(classic).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(switchOs).toBeFocused();
  });

  test('About this portfolio opens the About window and closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'System menu' }).click();
    await page.getByRole('button', { name: 'About this portfolio' }).click();
    await expect(page.getByRole('group', { name: 'System menu' })).toBeHidden();
    await expect(page.getByRole('dialog', { name: 'About' })).toContainText('Abu Bin Oalid');
  });

  test('the system menu closes on an outside click', async ({ page }) => {
    await page.getByRole('button', { name: 'System menu' }).click();
    const menu = page.getByRole('group', { name: 'System menu' });
    await expect(menu).toBeVisible();
    await page.mouse.click(720, 450);
    await expect(menu).toBeHidden();
  });

  test('Dock lists every app; Projects opens and the red light closes it', async ({ page }) => {
    for (const name of ['About', 'Projects', 'Experience', 'Skills', 'Resume', 'Contact', 'Terminal', 'Browser']) {
      await expect(dock(page).getByRole('button', { name, exact: true })).toBeVisible();
    }
    await dock(page).getByRole('button', { name: 'Projects' }).click();
    const win = page.getByRole('dialog', { name: 'Projects' });
    await expect(win).toBeVisible();
    await expect(menuBar(page).getByTestId('active-app')).toHaveText('Projects');
    await win.getByRole('button', { name: 'Close' }).click();
    await expect(win).toHaveCount(0);
    await expect(menuBar(page).getByTestId('active-app')).toHaveText('Portfolio');
  });

  test('the menu bar follows the focused window', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Skills' }).click();
    await dock(page).getByRole('button', { name: 'Contact' }).click();
    await expect(menuBar(page).getByTestId('active-app')).toHaveText('Contact');
    await page.getByRole('dialog', { name: 'Skills' }).getByText('Skills', { exact: true }).first().click();
    await expect(menuBar(page).getByTestId('active-app')).toHaveText('Skills');
  });

  test('clicking a focused app in the Dock keeps it open; minimize and Dock restore', async ({ page }) => {
    const item = dock(page).getByRole('button', { name: 'Experience' });
    await item.click();
    const win = page.getByRole('dialog', { name: 'Experience' });
    await expect(win).toBeVisible();
    await item.click();
    await expect(win).toBeVisible();

    await win.getByRole('button', { name: 'Minimize' }).click();
    await expect(win).toBeHidden();
    await item.click();
    await expect(win).toBeVisible();
  });

  test('the green light zooms the window', async ({ page }) => {
    await dock(page).getByRole('button', { name: 'Resume' }).click();
    const win = page.getByRole('dialog', { name: 'Resume' });
    const before = await win.boundingBox();
    await win.getByRole('button', { name: 'Zoom' }).click();
    await expect(async () => {
      const after = await win.boundingBox();
      expect(after?.width).toBe(1440);
      expect(after?.width).not.toBe(before?.width);
    }).toPass();
  });
});

test('Cmd+W closes the focused window', async ({ page }) => {
  await markBooted(page);
  await page.goto('/os/macos');
  await dock(page).getByRole('button', { name: 'Skills' }).click();
  const win = page.getByRole('dialog', { name: 'Skills' });
  await expect(win).toBeFocused();
  await page.keyboard.press('Meta+w');
  await expect(win).toHaveCount(0);
});

test('reduced motion turns Dock magnification off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/os/macos');
  const item = dock(page).getByRole('button', { name: 'Projects' });
  await expect(item).toBeVisible();
  const before = await item.boundingBox();
  await item.hover();
  await page.mouse.move(before!.x + before!.width / 2 + 2, before!.y + before!.height / 2);
  await page.waitForTimeout(300);
  expect((await item.boundingBox())!.width).toBe(before!.width);
});
