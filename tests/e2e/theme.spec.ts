import { expect, test } from '@playwright/test';

test('defaults to dark, toggles to light, persists on reload', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('footer links to OS versions', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Explore OS versions' })).toHaveAttribute('href', '/os');
});
