import { expect, test } from '@playwright/test';

const MAC_SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const UBUNTU_FIREFOX_UA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0';
const GOOGLEBOT_UA =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

test.describe('Mac visitor', () => {
  test.use({ userAgent: MAC_SAFARI_UA });

  test('sees the banner and Open navigates to /os/macos', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('region', { name: 'OS experience suggestion' });
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("You're on macOS. View this portfolio as macOS?");
    await banner.getByRole('link', { name: 'Open' }).click();
    await expect(page).toHaveURL(/\/os\/macos$/);
  });

  test('Not now hides it and stays hidden after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Not now' }).click();
    await expect(page.getByRole('region', { name: 'OS experience suggestion' })).toHaveCount(0);
    // `/` is ISR (stale-while-revalidate): on a reload Chrome serves cached prefetches and revalidates
    // them in the background, which devtools never reports as finished, so 'networkidle' would never
    // come. Routing bypasses the HTTP cache, like a visitor whose cache has expired.
    await page.route('**/*', (route) => route.continue());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'OS experience suggestion' })).toHaveCount(0);
  });
});

test.describe('Linux visitor', () => {
  test.use({ userAgent: UBUNTU_FIREFOX_UA });

  test('is offered the Ubuntu skin', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('region', { name: 'OS experience suggestion' });
    await expect(banner).toContainText("You're on Linux. View this portfolio as Ubuntu?");
    await expect(banner.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/os/ubuntu');
  });
});

test.describe('Googlebot', () => {
  test.use({ userAgent: GOOGLEBOT_UA });

  test('sees no banner', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('region', { name: 'OS experience suggestion' })).toHaveCount(0);
  });
});
