/**
 * RMM MCP Server
 * Model Context Protocol server for Azure DevOps integration
 * 
 * This server provides tools to fetch data from Azure DevOps:
 * - get_release_context: Get release information, work items, tests
 * - get_sprint_context: Get sprint information and work items
 * - get_work_items: Get specific work items by IDs
 * - get_test_results: Get test results for a build
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AzureDevOpsService } from './services/azure-devops.js';
import { MCPServer } from './mcp/server.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Azure DevOps service
const azureDevOpsService = new AzureDevOpsService({
  orgUrl: process.env.AZURE_DEVOPS_ORG_URL,
  token: process.env.AZURE_DEVOPS_PAT,
  project: process.env.AZURE_DEVOPS_PROJECT
});

// Initialize MCP server
const mcpServer = new MCPServer(azureDevOpsService);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'RMM MCP Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// MCP execute tool endpoint
app.post('/api/mcp/execute', async (req, res) => {
  try {
    const { tool, parameters } = req.body;
    
    console.log(`[MCP] Executing tool: ${tool}`, parameters);
    
    const result = await mcpServer.executeTool(tool, parameters);
    
    res.json(result);
  } catch (error) {
    console.error('[MCP] Error executing tool:', error);
    res.status(500).json({ 
      error: 'Failed to execute tool', 
      message: error.message 
    });
  }
});

// MCP query endpoint (custom queries)
app.post('/api/mcp/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    console.log(`[MCP] Executing query: ${query}`);
    
    const result = await mcpServer.executeQuery(query);
    
    res.json(result);
  } catch (error) {
    console.error('[MCP] Error executing query:', error);
    res.status(500).json({ 
      error: 'Failed to execute query', 
      message: error.message 
    });
  }
});

// Get available MCP tools
app.get('/api/mcp/tools', (req, res) => {
  const tools = mcpServer.getAvailableTools();
  res.json(tools);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════���═══════════════════════════════════════════════╗
║                                                           ║
║           RMM MCP Server - Azure DevOps Bridge           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Status: Running                                          ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║                                                           ║
║  Endpoints:                                               ║
║  - GET  /health                                           ║
║  - POST /api/mcp/execute                                  ║
║  - POST /api/mcp/query                                    ║
║  - GET  /api/mcp/tools                                    ║
║                                                           ║
║  Azure DevOps:                                            ║
║  - Organization: ${process.env.AZURE_DEVOPS_ORG_URL?.split('/').pop() || 'Not configured'}                              ║
║  - Project: ${process.env.AZURE_DEVOPS_PROJECT || 'Not configured'}                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MCP] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[MCP] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
