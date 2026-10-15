import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { skins } from '../../src/os/core/registry';

/** Fails on `serious` and `critical` axe findings; prints them so a failure is actionable. */
async function expectNoSeriousViolations(page: Page, label: string) {
  // Let entrance transitions finish: half-faded content gives false contrast results.
  // Infinite (decorative) loops never finish, so only finite ones are awaited.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
  );
  const { violations } = await new AxeBuilder({ page }).analyze();
  const serious = violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      targets: v.nodes.slice(0, 5).map((n) => `${n.target.join(' ')} — ${n.failureSummary?.split('\n').slice(1).join(' ')}`),
    }));
  expect(serious, `${label}: ${JSON.stringify(serious, null, 2)}`).toEqual([]);
}

const markBooted = (page: Page, id: string) =>
  page.addInitScript((key) => {
    try {
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }, `os-booted-${id}`);

const CLASSIC = ['/', '/projects/alhisab', '/resume', '/os'];

for (const theme of ['dark', 'light'] as const) {
  test.describe(`classic pages, ${theme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
          // Keep the OS banner out of the way; it is scanned on its own below.
          window.localStorage.setItem('os-suggest-dismissed', '1');
        } catch {
          /* ignore */
        }
      }, theme);
    });

    for (const path of CLASSIC) {
      test(`${path} has no serious axe violations`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectNoSeriousViolations(page, `${path} (${theme})`);
      });
    }
  });
}

test.describe('OS suggest banner', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`has no serious axe violations (${theme})`, async ({ page }) => {
      await page.addInitScript((t) => {
        try {
          window.localStorage.setItem('theme', t);
        } catch {
          /* ignore */
        }
      }, theme);
      await page.goto('/');
      await expect(page.getByRole('region', { name: 'OS experience suggestion' })).toBeVisible();
      await expectNoSeriousViolations(page, `banner (${theme})`);
    });
  }
});

for (const skin of skins.filter((s) => s.status === 'ready')) {
  test.describe(`/os/${skin.id}`, () => {
    test.skip(({ isMobile }) => skin.kind === 'desktop' && isMobile, 'desktop skins are scanned at desktop width');

    test.beforeEach(async ({ page }) => {
      await markBooted(page, skin.id);
      await page.goto(`/os/${skin.id}`);
      await expect(page.locator(`[data-os-skin="${skin.id}"]`)).toBeVisible();
      await expect(page.getByTestId('boot-screen')).toHaveCount(0);
    });

    test('idle has no serious axe violations', async ({ page }) => {
      if (skin.kind === 'desktop') await expect(page.locator('button[aria-pressed]').first()).toBeVisible();
      else await expect(page.getByRole('list', { name: 'Home screen' })).toBeVisible();
      await expectNoSeriousViolations(page, `${skin.id} idle`);
    });

    // App content is where most issues hide: About (shown by every skin) and Experience (long,
    // scrollable and without links, so its scroller must be keyboard-focusable).
    for (const app of ['About', 'Experience']) {
      test(`with ${app} open has no serious axe violations`, async ({ page }) => {
        if (skin.kind === 'desktop') {
          await page.locator('button[aria-pressed]').filter({ hasText: /^Terminal$/ }).dblclick();
          const input = page.getByRole('dialog', { name: 'Terminal' }).getByRole('textbox');
          await input.fill(`open ${app.toLowerCase()}`);
          await input.press('Enter');
          await expect(page.getByRole('dialog', { name: app })).toBeVisible();
        } else {
          await page.locator('[data-mobile="launcher"]').filter({ hasText: new RegExp(`^${app}$`) }).click();
          await expect(page.getByRole('region', { name: app })).toBeVisible();
        }
        await expectNoSeriousViolations(page, `${skin.id} ${app}`);
      });
    }
  });
}
