import { expect, type Locator, type Page, test } from '@playwright/test';

// Keyboard-only and reduced-motion regression guards: one desktop skin (chromium project) and one
// mobile skin (both projects). The manual pass over every desktop skin is in the Task 25 report.

const markBooted = (page: Page, id: string) =>
  page.addInitScript((key) => {
    try {
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }, `os-booted-${id}`);

/** Presses Tab until `target` has focus (at most `max` times). */
async function tabTo(page: Page, target: Locator, max = 30) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error(`Tab never reached ${target}`);
}

/**
 * Visible motion still running: finite animations longer than 1ms. Reduced motion clamps CSS
 * transitions to 0.01ms rather than removing them, and decorative infinite loops are not counted.
 */
const runningAnimations = (page: Page) =>
  page.evaluate(
    () =>
      document.getAnimations().filter((a) => {
        const timing = a.effect?.getComputedTiming();
        return a.playState === 'running' && timing?.iterations !== Infinity && Number(timing?.duration) > 1;
      }).length,
  );

/** Records, from the first parse, whether a boot screen was ever attached. */
const watchForBootScreen = (page: Page) =>
  page.addInitScript(() => {
    const w = window as unknown as { __bootSeen?: boolean };
    new MutationObserver(() => {
      if (document.querySelector('[data-testid="boot-screen"]')) w.__bootSeen = true;
    }).observe(document, { subtree: true, childList: true });
  });
const bootSeen = (page: Page) => page.evaluate(() => (window as unknown as { __bootSeen?: boolean }).__bootSeen === true);

test.describe('desktop skin (Windows 11)', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop skin');

  test('opens and closes a window with the keyboard only', async ({ page }) => {
    await markBooted(page, 'windows11');
    await page.goto('/os/windows11');
    const icon = page.locator('button[aria-pressed]').filter({ hasText: /^About$/ });
    await expect(icon).toBeVisible();

    await tabTo(page, icon);
    await page.keyboard.press('Enter');
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(about).toBeFocused();

    // Close shortcut, then focus goes back to the icon that opened the window.
    await page.keyboard.press('Alt+F4');
    await expect(about).toHaveCount(0);
    await expect(icon).toBeFocused();

    // Again via the Close button.
    await page.keyboard.press('Enter');
    await expect(about).toBeVisible();
    await tabTo(page, about.getByRole('button', { name: 'Close' }), 5);
    await page.keyboard.press('Enter');
    await expect(about).toHaveCount(0);
    await expect(icon).toBeFocused();
  });

  test('reduced motion: no boot screen and windows appear without animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await watchForBootScreen(page);
    await page.goto('/os/windows11');
    const taskbar = page.getByRole('navigation', { name: 'Taskbar' });
    await expect(taskbar).toBeVisible();
    expect(await bootSeen(page)).toBe(false);

    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('dialog', { name: 'Start' }).getByRole('button', { name: 'About', exact: true }).click();
    const about = page.getByRole('dialog', { name: 'About' });
    await expect(about).toBeVisible();
    expect(await about.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await runningAnimations(page)).toBe(0);
  });
});

test.describe('mobile skin', () => {
  test('iPhone: opens an app and goes back with the keyboard only', async ({ page }) => {
    await markBooted(page, 'iphone');
    await page.goto('/os/iphone');
    const launcher = page.getByRole('navigation', { name: 'Dock' }).getByRole('button', { name: 'About' });
    await expect(launcher).toBeVisible();

    await tabTo(page, launcher);
    await page.keyboard.press('Enter');
    const about = page.getByRole('region', { name: 'About' });
    await expect(about).toBeVisible();
    await expect(about).toBeFocused();

    await tabTo(page, about.getByRole('button', { name: /Back/ }), 5);
    await page.keyboard.press('Enter');
    await expect(about).toHaveCount(0);
    await expect(launcher).toBeFocused();
  });

  test('Samsung, reduced motion: no boot screen and apps open without animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await watchForBootScreen(page);
    await page.goto('/os/samsung');
    await expect(page.getByRole('list', { name: 'Home screen' })).toBeVisible();
    expect(await bootSeen(page)).toBe(false);

    await page.getByRole('navigation', { name: 'Dock' }).getByRole('button', { name: 'About' }).click();
    const about = page.getByRole('region', { name: 'About' });
    await expect(about).toBeVisible();
    expect(await about.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await runningAnimations(page)).toBe(0);
  });
});
