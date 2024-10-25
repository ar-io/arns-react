import { expect, test } from '@playwright/test';

const url = process.env.URL || 'http://localhost:4173/#/?search='; // Fallback to a default URL if not provided (vite preview standard port)

test.use({
  // Configure a mobile Chromium device.
  viewport: { width: 360, height: 740 }, // iPhone 6/7/8 dimensions as an example
  userAgent:
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
  browserName: 'chromium',
});

test('test', async ({ page }) => {
  test.setTimeout(60000); // Set a custom timeout for this test (e.g., 60 seconds)

  await page.goto(url);
  const notFoundPage = await page.getByTestId('404-page');
  await expect(notFoundPage).not.toBeVisible();
  await expect(page.getByText('Arweave Name System')).toBeVisible();
});
