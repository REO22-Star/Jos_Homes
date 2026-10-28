import { test, expect, type Page } from '@playwright/test';

/**
 * Auth + role-guard flows against the in-memory development accounts
 * (password: joshomes-dev). Exercises acceptance C1/C3-adjacent behaviour:
 * server-side guards, role separation, and safe session handling.
 */

async function signIn(page: Page, email: string) {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill('joshomes-dev');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('a guest is redirected from the dashboard to sign-in', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('a lister sees lister tools but not the admin area', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await expect(page.getByText('Signed in as')).toContainText('lister');
  await expect(page.getByRole('link', { name: 'My listings' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Administration' })).toHaveCount(0);
});

test('a lister is turned away from an admin-only page on the server', async ({ page }) => {
  await signIn(page, 'grace@example.test');
  await page.goto('/dashboard/admin');
  // Redirected back to the dashboard with a denial notice, never the admin page.
  await expect(page).toHaveURL(/\/dashboard\?denied=1/);
  await expect(page.getByText('You do not have permission to open that page')).toBeVisible();
});

test('an administrator can open the admin area', async ({ page }) => {
  await signIn(page, 'admin@example.test');
  await page.goto('/dashboard/admin');
  await expect(page.getByRole('heading', { name: 'Verification records' })).toBeVisible();
});

test('a moderator can open the review queue but not administration', async ({ page }) => {
  await signIn(page, 'mod@example.test');
  await page.goto('/dashboard/review');
  await expect(page.getByRole('heading', { name: 'Review queue' })).toBeVisible();
  await page.goto('/dashboard/admin');
  await expect(page).toHaveURL(/\/dashboard\?denied=1/);
});

test('signing out clears the session', async ({ page }) => {
  await signIn(page, 'seeker@example.test');
  await page.getByRole('button', { name: 'Sign out' }).click();
  // Back on the home page, whichever host and port the app is served from.
  await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/);
  // The session is gone: the dashboard again redirects to sign-in.
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/sign-in/);
});

test('a new seeker can register and land on the dashboard', async ({ page }, testInfo) => {
  await page.goto('/sign-up');
  await page.getByLabel('Name').fill('New Seeker');
  // Unique per project + run so parallel projects and re-runs never collide.
  const unique = `${testInfo.project.name}-${Date.now()}`;
  await page.getByLabel('Email address').fill(`seeker+${unique}@example.test`);
  await page.getByLabel('Password').fill('a-good-password');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText('Signed in as')).toContainText('seeker');
});

test('the wrong password is rejected with a generic message', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email address').fill('grace@example.test');
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(
    page.getByText('That email and password combination was not recognised.'),
  ).toBeVisible();
});
