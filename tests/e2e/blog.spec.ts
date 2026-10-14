import { expect, test } from '@playwright/test';

// Production build: the only post is a draft, so it must not be published.
test.describe('blog', () => {
  test('index shows the empty state', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('h1')).toHaveText('Blog');
    await expect(page.getByText('No posts yet. Check back soon.')).toBeVisible();
  });

  test('draft post returns 404', async ({ page }) => {
    const res = await page.goto('/blog/hello-world');
    expect(res?.status()).toBe(404);
  });
});
