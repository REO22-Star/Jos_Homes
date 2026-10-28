import { test, expect } from '@playwright/test';

const PUBLIC_PAGES = [
  '/',
  '/search',
  '/listing/bright-2-bedroom-rayfield',
  '/safety',
  '/how-it-works',
];

test('every key page has exactly one h1 and a skip link', async ({ page }) => {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 }), `single h1 on ${path}`).toHaveCount(1);
    await expect(
      page.getByRole('link', { name: 'Skip to main content' }),
      `skip link on ${path}`,
    ).toBeAttached();
  }
});

test('no horizontal overflow at the active viewport width (K3)', async ({ page }) => {
  for (const path of PUBLIC_PAGES) {
    await page.goto(path);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows, `no horizontal overflow on ${path}`).toBe(false);
  }
});

test('the robots and health endpoints respond', async ({ page }) => {
  const robots = await page.request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  const health = await page.request.get('/api/health');
  expect(health.ok()).toBeTruthy();
  expect((await health.json()).status).toBe('ok');
});
