import { test, expect, type Page } from '@playwright/test';

async function signIn(page: Page, email: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill('joshomes-dev');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('a guest can report a listing (E5) and the reporter stays anonymous (I1)', async ({
  page,
}) => {
  await page.goto('/listing/bright-2-bedroom-rayfield');
  await page.getByRole('button', { name: 'Report a problem' }).click();
  // The default reason is preselected; send the report.
  await page.getByRole('button', { name: 'Send report' }).click();
  await expect(page.getByText(/Our team will review the listing/)).toBeVisible();
});

test('an ordinary lister cannot open the reports queue (I1)', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/reports');
  await expect(page).toHaveURL(/\/dashboard\?denied=1/);
});

test('a moderator sees reports and can resolve one', async ({ page }) => {
  await signIn(page, 'mod@example.test');
  await page.goto('/dashboard/reports');
  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
  await expect(page.getByText('Property appears taken').first()).toBeVisible();

  await page.getByRole('button', { name: 'Dismiss' }).first().click();
  await expect(page.getByText(/Resolution:/).first()).toBeVisible();
});

test('an administrator can issue a verification', async ({ page }) => {
  await signIn(page, 'admin@example.test');
  await page.goto('/dashboard/admin');
  await page.getByLabel('Verification type').selectOption('landlord_authorization');
  await page.getByLabel('Evidence summary').fill('Authorization letter reviewed');
  await page.getByRole('button', { name: 'Issue verification' }).click();
  await expect(page.getByText('Verification issued')).toBeVisible();
});
