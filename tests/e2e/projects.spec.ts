import { expect, test } from '@playwright/test';

test.describe('projects', () => {
  test('index lists 5 project cards', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toHaveText('Projects');
    await expect(page.locator('article')).toHaveCount(5);
  });

  test('case study renders MDX with no leaked comments', async ({ page }) => {
    await page.goto('/projects/alhisab');
    await expect(page.locator('h1')).toHaveText('Alhisab');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.locator('main')).not.toContainText('TODO(owner)');
    const live = page.getByRole('link', { name: 'Live site' });
    await expect(live).toHaveAttribute('target', '_blank');
    await expect(page.getByRole('link', { name: '← All projects' })).toBeVisible();
  });

  test('unknown slug returns 404', async ({ page }) => {
    const res = await page.goto('/projects/does-not-exist');
    expect(res?.status()).toBe(404);
  });
});
