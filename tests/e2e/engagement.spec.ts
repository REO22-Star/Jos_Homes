import { test, expect } from '@playwright/test';

// A public seed listing that is available for contact.
const LISTING = '/listing/bright-2-bedroom-rayfield';

test('an inspection request requires consent, then succeeds (G1)', async ({ page }) => {
  await page.goto(LISTING);
  await page.getByRole('button', { name: 'Request an inspection' }).click();

  await page.getByLabel('Full name').fill('Amina Test');
  await page.getByLabel('Phone number').fill('+2348000000123');

  // Submitting without ticking consent is rejected server-side (G1).
  await page.getByRole('button', { name: 'Send inspection request' }).click();
  await expect(page.getByText(/must agree to share/i)).toBeVisible();

  // With consent, the request is accepted.
  await page.getByLabel(/agree that JosHomes may share/i).check();
  await page.getByRole('button', { name: 'Send inspection request' }).click();
  await expect(page.getByText('Request sent', { exact: true })).toBeVisible();
});

test('the call action reveals the contact only after a deliberate click (OQ-007)', async ({
  page,
}) => {
  await page.goto(LISTING);
  await page.getByRole('button', { name: 'Call lister' }).click();
  await expect(page.getByRole('heading', { name: 'Call the listing contact' })).toBeVisible();
});

test('contact actions are disabled on a taken listing (E4)', async ({ page }) => {
  await page.goto('/listing/taken-2-bedroom-bukuru');
  await expect(page.getByRole('button', { name: 'Request an inspection' })).toBeDisabled();
});
