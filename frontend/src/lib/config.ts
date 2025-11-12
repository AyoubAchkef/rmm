/**
 * Application Configuration
 * Centralized configuration management for the application
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5154',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
    endpoints: {
      reports: '/api/reports',
      health: '/health',
      ai: {
        mcpHealth: '/api/ai/mcp/health',
        generateReport: '/api/ai/generate-report',
        completeSection: '/api/ai/complete-section',
        chat: '/api/ai/chat',
      },
    },
  },
  app: {
    name: 'CR MEP Report',
    version: '1.0.0',
  },
} as const;

export type Config = typeof config;
