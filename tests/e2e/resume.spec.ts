import { expect, test } from '@playwright/test';

test.describe('resume', () => {
  test('shows experience and the PDF download link', async ({ page }) => {
    await page.goto('/resume');
    await expect(page.locator('h1')).toHaveText('Abu Bin Oalid');
    for (const company of ['6amTech', 'RetinaSoft', 'IGL Web Ltd']) {
      await expect(page.getByRole('heading', { name: company })).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      '/resume/abu-bin-oalid.pdf',
    );
  });

  test('print media hides header, footer and theme toggle', async ({ page }) => {
    await page.goto('/resume');
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('header').first()).toBeHidden();
    await expect(page.locator('footer')).toBeHidden();
    await expect(page.getByRole('button', { name: /Switch to/ })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Download PDF' })).toBeHidden();
  });
});
