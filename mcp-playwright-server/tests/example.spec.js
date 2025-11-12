/**
 * Example Playwright Test
 * This is a sample test to demonstrate Playwright capabilities
 */

import { test, expect } from '@playwright/test';

test.describe('Example Tests', () => {
  test('should load a page', async ({ page }) => {
    // Navigate to a page
    await page.goto('https://playwright.dev/');
    
    // Assert page title
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should click a button', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    
    // Click on "Get started" link
    await page.click('text=Get started');
    
    // Assert URL changed
    await expect(page).toHaveURL(/.*docs.*/);
  });

  test('should take a screenshot', async ({ page }) => {
    await page.goto('https://playwright.dev/');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/example-screenshot.png' });
  });
});
