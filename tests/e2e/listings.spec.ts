import { test, expect, type Page } from '@playwright/test';

async function signIn(page: Page, email: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill('joshomes-dev');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('a lister cannot open the moderator review queue', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/review');
  await expect(page).toHaveURL(/\/dashboard\?denied=1/);
});

test('draft → submit → moderator approve → public (D1/D2/C2 path)', async ({
  page,
  browser,
}, testInfo) => {
  const title = `E2E Home ${testInfo.project.name} ${Date.now()}`;

  // --- Lister creates and completes a draft ---
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/listings');
  await page.getByRole('button', { name: 'Create a draft' }).click();
  await expect(page).toHaveURL(/\/dashboard\/listings\/[0-9a-f-]+$/);
  const editUrl = page.url();

  await page.getByLabel('Listing title').fill(title);
  await page
    .getByLabel('Public description')
    .fill('A neat and tidy home with steady water and prepaid metering, tiled throughout.');
  await page.getByLabel('Area').selectOption('rayfield');
  await page.getByLabel('Property type').selectOption('two_bedroom');
  await page.getByLabel('Private address', { exact: true }).fill('9 E2E Close, Rayfield');
  await page.getByLabel('Rent (NGN)').fill('850000');
  await page.getByLabel('Additional fees disclosure').selectOption('none_known');
  await page.getByLabel('Available from').fill('2026-09-01');
  await page.getByLabel('Contact phone').fill('+2348000000009');
  await page.getByLabel(/authorized to advertise/i).check();
  await page.getByRole('button', { name: 'Save draft' }).click();
  await expect(page.getByText('Draft saved.')).toBeVisible();

  // Upload the three images required before a listing can be submitted.
  await page.locator('input[type="file"]').setInputFiles([
    { name: 'a.png', mimeType: 'image/png', buffer: Buffer.from('image-a') },
    { name: 'b.png', mimeType: 'image/png', buffer: Buffer.from('image-b') },
    { name: 'c.png', mimeType: 'image/png', buffer: Buffer.from('image-c') },
  ]);
  await page.getByRole('button', { name: 'Upload images' }).click();
  await expect(page.getByText(/image\(s\) uploaded/)).toBeVisible();

  // A completed draft with photos can now be submitted for review.
  await page.reload();
  await page.getByRole('button', { name: 'Submit for review' }).click();
  await expect(page).toHaveURL(/\/dashboard\/listings\?submitted=1/);

  // --- Moderator approves it (separate session) ---
  const modPage = await (await browser.newContext()).newPage();
  await signIn(modPage, 'mod@example.test');
  await modPage.goto('/dashboard/review');
  // Navigate via the item's href directly for a deterministic hard navigation.
  const href = await modPage.getByRole('link', { name: title }).getAttribute('href');
  await modPage.goto(href!);
  await expect(modPage.getByRole('heading', { name: title })).toBeVisible();
  // Approve one image so it becomes public, then approve the listing itself.
  await modPage.getByRole('button', { name: 'Approve image' }).first().click();
  await modPage.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(modPage).toHaveURL(/\/dashboard\/review\?done=1/);
  await modPage.context().close();

  // --- The approved listing is now public (guest, no account) ---
  const pub = await (await browser.newContext()).newPage();
  await pub.goto('/search');
  await expect(pub.getByText(title)).toBeVisible();
  await pub.getByRole('link', { name: title }).click();
  await expect(pub).toHaveURL(/\/listing\//);
  // The approved uploaded image is served from the media route.
  await expect(pub.locator('img[src*="/api/media/"]').first()).toBeVisible();
  // And its private address never appears on the public page.
  const html = await pub.content();
  expect(html).not.toContain('E2E Close');
  await pub.context().close();

  // --- The lister reconfirms availability and the stamp shows it (E1) ---
  await page.goto(editUrl);
  await page.getByRole('button', { name: 'Reconfirm availability' }).click();
  await expect(page.getByText('Availability reconfirmed.')).toBeVisible();
  await expect(page.locator('time').filter({ hasText: /^\d{1,2} [A-Z][a-z]{2}$/ })).toBeVisible();
  await expect(page.getByText('Confirmed today')).toBeVisible();
});

test('a non-image upload is rejected with a message (H1)', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/listings');
  await page.getByRole('button', { name: 'Create a draft' }).click();
  await expect(page).toHaveURL(/\/dashboard\/listings\/[0-9a-f-]+$/);

  await page
    .locator('input[type="file"]')
    .setInputFiles([
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') },
    ]);
  await page.getByRole('button', { name: 'Upload images' }).click();
  await expect(page.getByText(/not supported/i)).toBeVisible();
});

test('an incomplete draft cannot be submitted (D2)', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/listings');
  await page.getByRole('button', { name: 'Create a draft' }).click();
  await expect(page).toHaveURL(/\/dashboard\/listings\/[0-9a-f-]+$/);
  // A brand-new blank draft lists missing requirements and offers no submit button.
  await expect(page.getByText('Before you can submit')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit for review' })).toHaveCount(0);
});
