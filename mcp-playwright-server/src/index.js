/**
 * RMM MCP Playwright Server
 * Test Automation Server for external applications
 * 
 * This server provides tools to execute automated tests:
 * - Execute tests on external applications (CRM Ariane, etc.)
 * - Manage test scenarios
 * - Generate test reports
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PlaywrightService } from './services/playwright.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Playwright service
const playwrightService = new PlaywrightService({
  baseUrl: process.env.BASE_URL,
  defaultBrowser: process.env.DEFAULT_BROWSER || 'chromium',
  headless: process.env.HEADLESS === 'true',
  timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 30000,
  resultsDir: process.env.RESULTS_DIR || './test-results'
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await playwrightService.isHealthy();
    res.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'RMM MCP Playwright Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      browsers: playwrightService.getAvailableBrowsers()
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

/**
 * Execute a test
 */
app.post('/api/playwright/execute', async (req, res) => {
  try {
    const { url, actions, browser, timeout } = req.body;

    if (!url) {
      return res.status(400).json({ 
        error: 'URL is required' 
      });
    }

    console.log(`[API] POST /api/playwright/execute - ${url}`);

    const results = await playwrightService.executeTest({
      url,
      actions: actions || [],
      browser,
      timeout
    });

    res.json(results);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to execute test', 
      message: error.message 
    });
  }
});

/**
 * Get available browsers
 */
app.get('/api/playwright/browsers', (req, res) => {
  res.json({
    browsers: playwrightService.getAvailableBrowsers(),
    default: process.env.DEFAULT_BROWSER || 'chromium'
  });
});

/**
 * Get configuration
 */
app.get('/api/playwright/config', (req, res) => {
  res.json({
    baseUrl: process.env.BASE_URL,
    defaultBrowser: process.env.DEFAULT_BROWSER || 'chromium',
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.DEFAULT_TIMEOUT) || 30000
  });
});

/**
 * Get available tools
 */
app.get('/api/mcp/tools', (req, res) => {
  res.json([
    'execute_test',
    'get_browsers',
    'get_config'
  ]);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        RMM MCP Playwright Server - Test Automation       ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Status: Running                                          ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║                                                           ║
║  Endpoints:                                               ║
║  - GET  /health                                           ║
║  - POST /api/playwright/execute                           ║
║  - GET  /api/playwright/browsers                          ║
║  - GET  /api/playwright/config                            ║
║  - GET  /api/mcp/tools                                    ║
║                                                           ║
║  Browsers Available:                                      ║
║  - Chromium                                               ║
║  - Firefox                                                ║
║  - WebKit (Safari)                                        ║
║                                                           ║
║  Base URL: ${process.env.BASE_URL || 'Not configured'}                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Playwright] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Playwright] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
