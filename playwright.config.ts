import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for critical public journeys (Milestone 0: public navigation).
 * Runs against a production build so tests reflect what ships.
 *
 * The tests use their own port (3100, or E2E_PORT) rather than Next's default
 * 3000, so a different app already running on 3000 is never mistaken for
 * JosHomes and tested instead.
 */
const port = Number(process.env.E2E_PORT) || 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : [['list']],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // The production build has NODE_ENV=production, where mock auth is off by
    // default and a session secret is required. Enable the development auth
    // provider and supply a secret so the auth/role flows are exercisable.
    // No Supabase env is set, so the app uses the in-memory dev accounts.
    env: {
      JOSHOMES_ALLOW_DEV_AUTH: 'true',
      SESSION_SECRET: 'e2e-session-secret-at-least-16-characters',
    },
  },
});
