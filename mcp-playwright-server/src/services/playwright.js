/**
 * Playwright Service
 * Handles test execution and management
 */

import { chromium, firefox, webkit } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export class PlaywrightService {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.defaultBrowser = config.defaultBrowser || 'chromium';
    this.headless = config.headless !== false;
    this.timeout = config.timeout || 30000;
    this.resultsDir = config.resultsDir || './test-results';
  }

  /**
   * Get browser instance
   */
  async getBrowser(browserType = this.defaultBrowser) {
    const browsers = {
      chromium: chromium,
      firefox: firefox,
      webkit: webkit
    };

    const browser = browsers[browserType] || chromium;
    return await browser.launch({ headless: this.headless });
  }

  /**
   * Execute a simple test
   */
  async executeTest(testConfig) {
    const {
      url,
      actions = [],
      browser: browserType = this.defaultBrowser,
      timeout = this.timeout
    } = testConfig;

    let browser;
    let context;
    let page;
    const results = {
      success: false,
      duration: 0,
      screenshots: [],
      errors: [],
      logs: []
    };

    const startTime = Date.now();

    try {
      console.log(`[Playwright] Starting test on ${url}`);
      
      // Launch browser
      browser = await this.getBrowser(browserType);
      context = await browser.newContext();
      page = await context.newPage();

      // Set timeout
      page.setDefaultTimeout(timeout);

      // Navigate to URL
      await page.goto(url);
      results.logs.push(`Navigated to ${url}`);

      // Execute actions
      for (const action of actions) {
        await this.executeAction(page, action, results);
      }

      results.success = true;
      results.duration = Date.now() - startTime;

      console.log(`[Playwright] Test completed successfully in ${results.duration}ms`);

    } catch (error) {
      console.error('[Playwright] Test failed:', error.message);
      results.success = false;
      results.errors.push(error.message);
      results.duration = Date.now() - startTime;

      // Take screenshot on error
      if (page) {
        try {
          const screenshotPath = path.join(this.resultsDir, `error-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath });
          results.screenshots.push(screenshotPath);
        } catch (screenshotError) {
          console.error('[Playwright] Failed to take screenshot:', screenshotError.message);
        }
      }
    } finally {
      // Cleanup
      if (context) await context.close();
      if (browser) await browser.close();
    }

    return results;
  }

  /**
   * Execute a single action
   */
  async executeAction(page, action, results) {
    const { type, selector, value, text } = action;

    try {
      switch (type) {
        case 'click':
          await page.click(selector);
          results.logs.push(`Clicked on ${selector}`);
          break;

        case 'fill':
          await page.fill(selector, value);
          results.logs.push(`Filled ${selector} with value`);
          break;

        case 'type':
          await page.type(selector, value);
          results.logs.push(`Typed into ${selector}`);
          break;

        case 'wait':
          await page.waitForSelector(selector);
          results.logs.push(`Waited for ${selector}`);
          break;

        case 'screenshot':
          const screenshotPath = path.join(this.resultsDir, `screenshot-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath });
          results.screenshots.push(screenshotPath);
          results.logs.push(`Screenshot saved: ${screenshotPath}`);
          break;

        case 'assertText':
          const content = await page.textContent(selector);
          if (content.includes(text)) {
            results.logs.push(`Assertion passed: Found "${text}" in ${selector}`);
          } else {
            throw new Error(`Assertion failed: "${text}" not found in ${selector}`);
          }
          break;

        default:
          results.logs.push(`Unknown action type: ${type}`);
      }
    } catch (error) {
      throw new Error(`Action ${type} failed: ${error.message}`);
    }
  }

  /**
   * Check if Playwright is working
   */
  async isHealthy() {
    try {
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      return true;
    } catch (error) {
      console.error('[Playwright] Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get list of available browsers
   */
  getAvailableBrowsers() {
    return ['chromium', 'firefox', 'webkit'];
  }

  /**
   * Get test results directory
   */
  getResultsDir() {
    return this.resultsDir;
  }
}
