import { expect, type Page, test } from '@playwright/test';

// Runs in both projects: chromium (1440px, device frame) and mobile-safari (iPhone-sized, full-screen).

const home = (page: Page) => page.getByRole('list', { name: 'Home screen' });
const dock = (page: Page) => page.getByRole('navigation', { name: 'Dock' });
const appScreen = (page: Page, name: string) => page.getByRole('region', { name });

test.beforeEach(async ({ page }) => {
  // The iPhone skin has no boot screen; the flag keeps this spec stable if one is added later.
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('os-booted-iphone', '1');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/os/iphone');
  await expect(home(page)).toBeVisible();
});

test('shows the status bar time and a labelled home grid and dock', async ({ page }) => {
  await expect(page.locator('[data-os-skin="iphone"]')).toBeVisible();
  await expect(page.locator('[data-mobile="status-bar"] time')).toHaveText(/^\d{1,2}[:.]\d{2}$/);
  for (const name of ['Experience', 'Skills', 'Resume', 'Browser', 'Switch OS']) {
    await expect(home(page).getByRole('button', { name, exact: true })).toBeVisible();
  }
  for (const name of ['About', 'Projects', 'Contact', 'Terminal']) {
    await expect(dock(page).getByRole('button', { name, exact: true })).toBeVisible();
  }
});

test('tapping About opens it; Go home returns to the grid', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'About' }).click();
  const about = appScreen(page, 'About');
  await expect(about.getByText('Abu Bin Oalid').first()).toBeVisible();
  await page.getByRole('button', { name: 'Go home' }).click();
  await expect(about).toHaveCount(0);
  await expect(home(page).getByRole('button', { name: 'Skills' })).toBeVisible();
});

test('the header back button returns home; Projects opens a detail view', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Projects' }).click();
  const projects = appScreen(page, 'Projects');
  await projects.locator('.os-card').first().click();
  await expect(projects.getByRole('button', { name: '← All projects' })).toBeVisible();
  await projects.getByRole('button', { name: '‹ Back' }).click();
  await expect(projects).toHaveCount(0);
});

test('the large title is the heading; app headings that differ stay visible', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Projects' }).click();
  const projects = appScreen(page, 'Projects');
  await expect(projects.getByRole('heading', { level: 1 })).toHaveText('Projects');
  await page.getByRole('button', { name: 'Go home' }).click();
  await home(page).getByRole('button', { name: 'Browser' }).click();
  const browser = appScreen(page, 'Browser');
  await expect(browser.getByRole('heading', { level: 1, name: 'Browser' })).toBeVisible();
  await expect(browser.getByRole('heading', { level: 2, name: 'Blog' })).toBeVisible();
  await expect(browser.getByRole('heading', { level: 1 })).toHaveCount(1);
});

test('Terminal `open skills` switches to the Skills app', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Terminal' }).click();
  const input = appScreen(page, 'Terminal').getByRole('textbox');
  await input.fill('open skills');
  await input.press('Enter');
  await expect(appScreen(page, 'Skills')).toBeVisible();
  await expect(appScreen(page, 'Terminal')).toHaveCount(0);
});

test('Switch OS lists every skin and the classic view', async ({ page }) => {
  await home(page).getByRole('button', { name: 'Switch OS' }).click();
  const nav = appScreen(page, 'Switch OS').getByRole('navigation', { name: 'Switch OS version' });
  await expect(nav.getByRole('link', { name: 'iPhone' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Windows 11' })).toHaveAttribute('href', '/os/windows11');
  await expect(nav.getByRole('link', { name: 'macOS' })).toHaveAttribute('href', '/os/macos');
  await expect(nav.getByRole('link', { name: 'Samsung One UI' })).toHaveAttribute('href', '/os/samsung');
  await expect(appScreen(page, 'Switch OS').getByRole('link', { name: 'Back to classic view' })).toHaveAttribute(
    'href',
    '/',
  );
});

test('a swipe up from the bottom edge goes home and app taps still work', async ({ page }) => {
  await dock(page).getByRole('button', { name: 'Projects' }).click();
  const projects = appScreen(page, 'Projects');
  // Content low on the screen still takes taps: nothing overlays the app for the gesture.
  await projects.locator('.os-card').last().click();
  await expect(projects.getByRole('button', { name: '← All projects' })).toBeVisible();
  const box = await page.getByTestId('device-screen').boundingBox();
  if (!box) throw new Error('no device screen');
  const x = box.x + box.width / 2;
  await page.mouse.move(x, box.y + box.height - 6);
  await page.mouse.down();
  await page.mouse.move(x, box.y + box.height - 60, { steps: 4 });
  await page.mouse.move(x, box.y + box.height - 200, { steps: 4 });
  await page.mouse.up();
  await expect(projects).toHaveCount(0);
});

test('device frame on wide screens, full-screen on phones', async ({ page, isMobile }) => {
  const frame = page.getByTestId('device-screen');
  await expect(frame).toBeVisible();
  const box = await frame.boundingBox();
  const viewport = page.viewportSize();
  if (!box || !viewport) throw new Error('no geometry');
  if (isMobile) {
    expect(box.width).toBe(viewport.width);
    expect(box.height).toBe(viewport.height);
  } else {
    await expect(page.getByTestId('device-frame')).toBeVisible();
    expect(Math.round(box.width)).toBe(390);
    expect(Math.round(box.height)).toBe(844);
    expect(Math.round(box.x + box.width / 2)).toBe(viewport.width / 2);
  }
});
