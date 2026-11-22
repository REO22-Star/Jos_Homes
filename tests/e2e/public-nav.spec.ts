import { test, expect } from '@playwright/test';

// Private strings that must never surface on any public page (acceptance A5).
const PRIVATE_MARKERS = ['Fictional Close', 'Fictional Lane', 'Fictional Boulevard'];

test('guest browses home → search → listing without an account', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('available in Jos');

  await page.getByRole('button', { name: 'Search available homes' }).click();
  await expect(page).toHaveURL(/\/search/);

  const cards = page.getByRole('article');
  await expect(cards.first()).toBeVisible();

  // Open the first listing via its title link.
  await cards.first().getByRole('link').first().click();
  await expect(page).toHaveURL(/\/listing\//);
  await expect(page.getByRole('heading', { name: 'Cost' })).toBeVisible();
  await expect(page.getByText('Estimated move-in total')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Call lister' })).toBeVisible();
});

test('no public page exposes a private address or raw phone (A5)', async ({ page }) => {
  for (const path of ['/search', '/listing/bright-2-bedroom-rayfield']) {
    await page.goto(path);
    const html = await page.content();
    for (const marker of PRIVATE_MARKERS) {
      expect(html, `${path} should not contain "${marker}"`).not.toContain(marker);
    }
    expect(html).not.toMatch(/\+234800000000\d/);
  }
});

test('filters are reflected in the URL and restored (A2)', async ({ page }) => {
  await page.goto('/search?area=rayfield');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rayfield');
  // The area select reflects the shared filter.
  await expect(page.locator('#f-area')).toHaveValue('rayfield');
});

test('search shows results first on phones and keeps filters open on desktop', async ({
  page,
}, testInfo) => {
  // Three filters that still match a seeded listing (an empty result opens the panel).
  await page.goto('/search?area=tudun-wada&furnished=true&maxRent=2000000');
  const toggle = page.locator('summary', { hasText: 'Filters' });
  const areaSelect = page.getByLabel('Area');

  if (testInfo.project.name === 'mobile-chrome') {
    // Collapsed, with the number of active filters on the toggle.
    await expect(toggle).toContainText('3 active');
    await expect(areaSelect).toBeHidden();
    // The first result row is visible without scrolling.
    await expect(
      page.getByRole('region', { name: 'Search results' }).locator('li').first(),
    ).toBeInViewport();
    await toggle.click();
    await expect(areaSelect).toBeVisible();
    await expect(areaSelect).toHaveValue('tudun-wada');
  } else {
    await expect(toggle).toBeHidden();
    await expect(areaSelect).toBeVisible();
    await expect(page.getByRole('button', { name: 'Apply filters' })).toBeVisible();
  }
});

test('search with no results opens the filters so the search can be widened', async ({ page }) => {
  await page.goto('/search?minRent=999000000');
  await expect(page.getByText('No current listings match these filters.')).toBeVisible();
  await expect(page.getByLabel('Area')).toBeVisible();
});

test('taken listing shows the taken experience and disables contact (B4, E4)', async ({ page }) => {
  await page.goto('/listing/taken-2-bedroom-bukuru');
  await expect(page.getByText('This property is taken', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Call lister' })).toBeDisabled();
  // Offers alternatives.
  await expect(page.getByRole('heading', { name: /Similar available/ })).toBeVisible();
});

test('unapproved and unknown listings are not publicly reachable (A3)', async ({ page }) => {
  for (const slug of ['draft-hidden-listing', 'does-not-exist']) {
    await page.goto(`/listing/${slug}`);
    await expect(page.getByText('This page could not be found')).toBeVisible();
  }
});

test('no video autoplays anywhere on a listing page (B2)', async ({ page }) => {
  await page.goto('/listing/bright-2-bedroom-rayfield');
  await expect(page.locator('video[autoplay]')).toHaveCount(0);
});

test('primary navigation reaches the safety page on mobile and desktop', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: /open menu/i });
  if (await menu.isVisible()) {
    await menu.click();
  }
  await page.getByRole('link', { name: 'Safety', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Safety guide' })).toBeVisible();
});

test('sponsored listings are visibly labelled in results (A4)', async ({ page }) => {
  await page.goto('/search');
  await expect(page.getByText('Sponsored listing').first()).toBeVisible();
});

test('"List a property" leads to sign-up with the lister account type chosen', async ({ page }) => {
  await page.goto('/list-a-property');
  await expect(page.getByText(/not part of this prototype/)).toHaveCount(0);
  await page.getByRole('link', { name: 'Create a lister account' }).click();
  await expect(page).toHaveURL(/\/sign-up\?as=lister/);
  await expect(page.getByLabel('Account type')).toHaveValue('lister');
});
