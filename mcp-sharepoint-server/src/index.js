/**
 * RMM MCP SharePoint Server
 * Microsoft Graph API Bridge for SharePoint integration
 * 
 * This server provides tools to interact with SharePoint:
 * - Get site information
 * - List documents
 * - Upload documents
 * - Create folders
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SharePointService } from './services/sharepoint.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SharePoint service
const sharePointService = new SharePointService({
  tenantId: process.env.AZURE_TENANT_ID,
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  siteUrl: process.env.SHAREPOINT_SITE_URL
});

// ============================================
// ENDPOINTS
// ============================================

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await sharePointService.isHealthy();
    res.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'RMM MCP SharePoint Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      siteUrl: process.env.SHAREPOINT_SITE_URL
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

/**
 * Get site information
 */
app.get('/api/sharepoint/site', async (req, res) => {
  try {
    console.log('[API] GET /api/sharepoint/site');
    const siteInfo = await sharePointService.getSiteInfo();
    res.json(siteInfo);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get site info', 
      message: error.message 
    });
  }
});

/**
 * List documents in a library
 */
app.get('/api/sharepoint/documents', async (req, res) => {
  try {
    const library = req.query.library || 'Documents';
    console.log(`[API] GET /api/sharepoint/documents?library=${library}`);
    
    const documents = await sharePointService.listDocuments(library);
    res.json({ 
      library,
      count: documents.length,
      documents 
    });
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to list documents', 
      message: error.message 
    });
  }
});

/**
 * Get a specific document
 */
app.get('/api/sharepoint/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API] GET /api/sharepoint/documents/${id}`);
    
    const document = await sharePointService.getDocument(id);
    
    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found' 
      });
    }
    
    res.json(document);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get document', 
      message: error.message 
    });
  }
});

/**
 * Upload a document
 */
app.post('/api/sharepoint/upload', async (req, res) => {
  try {
    const { fileName, content, folderPath } = req.body;
    
    if (!fileName || !content) {
      return res.status(400).json({ 
        error: 'fileName and content are required' 
      });
    }
    
    console.log(`[API] POST /api/sharepoint/upload - ${fileName}`);
    
    const result = await sharePointService.uploadDocument(
      fileName, 
      content, 
      folderPath
    );
    
    res.json(result);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to upload document', 
      message: error.message 
    });
  }
});

/**
 * Create a folder
 */
app.post('/api/sharepoint/folders', async (req, res) => {
  try {
    const { folderName, parentPath } = req.body;
    
    if (!folderName) {
      return res.status(400).json({ 
        error: 'folderName is required' 
      });
    }
    
    console.log(`[API] POST /api/sharepoint/folders - ${folderName}`);
    
    const result = await sharePointService.createFolder(
      folderName, 
      parentPath
    );
    
    res.json(result);
  } catch (error) {
    console.error('[API] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create folder', 
      message: error.message 
    });
  }
});

/**
 * Get available tools
 */
app.get('/api/mcp/tools', (req, res) => {
  res.json([
    'get_site_info',
    'list_documents',
    'get_document',
    'upload_document',
    'create_folder'
  ]);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     RMM MCP SharePoint Server - Graph API Bridge         ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Status: Running                                          ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║                                                           ║
║  Endpoints:                                               ║
║  - GET  /health                                           ║
║  - GET  /api/sharepoint/site                              ║
║  - GET  /api/sharepoint/documents                         ║
║  - GET  /api/sharepoint/documents/:id                     ║
║  - POST /api/sharepoint/upload                            ║
║  - POST /api/sharepoint/folders                           ║
║  - GET  /api/mcp/tools                                    ║
║                                                           ║
║  SharePoint Site:                                         ║
║  ${process.env.SHAREPOINT_SITE_URL?.substring(0, 55) || 'Not configured'}     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SharePoint] SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[SharePoint] SIGINT received, shutting down gracefully...');
  process.exit(0);
});
