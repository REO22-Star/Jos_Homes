import { test, expect, type Page, type TestInfo } from '@playwright/test';

/** Register a fresh, uniquely-named seeker so parallel projects never collide. */
async function signUpSeeker(page: Page, testInfo: TestInfo) {
  await page.goto('/sign-up');
  await page.getByLabel('Name').fill('Test Seeker');
  await page
    .getByLabel('Email address')
    .fill(`s-${testInfo.project.name}-${Date.now()}@example.test`);
  await page.getByLabel('Password').fill('a-good-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('a guest must sign in to save a home', async ({ page }) => {
  await page.goto('/listing/bright-2-bedroom-rayfield');
  await page.getByRole('button', { name: /Save property/ }).click();
  await expect(page.getByText('Please sign in to save homes.')).toBeVisible();
});

test('a seeker can save a home and see it in Saved homes', async ({ page }, testInfo) => {
  await signUpSeeker(page, testInfo);
  await page.goto('/listing/bright-2-bedroom-rayfield');
  await page.getByRole('button', { name: /Save property/ }).click();
  await expect(page.getByRole('button', { name: /Saved/ })).toBeVisible();

  await page.goto('/dashboard/saved');
  await expect(page.getByRole('link', { name: /Bright 2 bedroom flat/ })).toBeVisible();
});

test('a seeker can save a search and find it in Saved searches', async ({ page }, testInfo) => {
  await signUpSeeker(page, testInfo);
  await page.goto('/search?area=rayfield');
  await page.getByLabel('Search name').fill('Rayfield homes');
  await page.getByRole('button', { name: 'Save search' }).click();
  await expect(page.getByText(/Search saved/)).toBeVisible();

  await page.goto('/dashboard/searches');
  await expect(page.getByRole('heading', { name: 'Rayfield homes' })).toBeVisible();
});

test('marketing preference can be updated (distinct from operational)', async ({
  page,
}, testInfo) => {
  await signUpSeeker(page, testInfo);
  await page.goto('/dashboard/preferences');
  await expect(page.getByLabel(/marketing emails/i)).not.toBeChecked();
  await page.getByLabel(/marketing emails/i).check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByText('Preferences saved.')).toBeVisible();
});
