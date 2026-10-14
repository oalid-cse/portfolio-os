import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('has a single h1 with the name', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Abu Bin Oalid');
  });

  test('every section is visible after scrolling', async ({ page }) => {
    await page.goto('/');
    for (const id of ['about', 'skills', 'experience', 'projects', 'education', 'contact']) {
      const section = page.locator(`#${id}`);
      await section.scrollIntoViewIfNeeded();
      await expect(section).toBeVisible();
    }
  });

  test('Download CV links to the PDF', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
      'href',
      '/resume/abu-bin-oalid.pdf',
    );
  });

  test('shows 4 featured project cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#projects article')).toHaveCount(4);
  });

  test('has no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
