import { defineConfig, devices } from '@playwright/test';

/**
 * Browser tests for critical public journeys (Milestone 0: public navigation).
 * Runs against a production build so tests reflect what ships.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : [['list']],
  use: {
    baseURL: 'http://localhost:3000',
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
    command: 'npm run start',
    url: 'http://localhost:3000',
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
