import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./tests/playwright/setup'),
  testDir: './tests/playwright', // Set the root directory for tests
  testMatch: '**/*.spec.ts', // Only run tests that match this pattern
  // You can define other Playwright config options here
});
