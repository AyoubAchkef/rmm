/**
 * SharePoint Service
 * Handles all interactions with SharePoint via Microsoft Graph API
 */

import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

export class SharePointService {
  constructor(config) {
    this.tenantId = config.tenantId;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.siteUrl = config.siteUrl;
    this.useMockData = config.useMockData || false;
    
    if (!this.useMockData) {
      // Initialize credential for real Microsoft Graph API
      this.credential = new ClientSecretCredential(
        this.tenantId,
        this.clientId,
        this.clientSecret
      );
      
      // Initialize Graph client
      this.client = Client.initWithMiddleware({
        authProvider: {
          getAccessToken: async () => {
            const token = await this.credential.getToken(
              'https://graph.microsoft.com/.default'
            );
            return token.token;
          }
        }
      });
    }
  }

  /**
   * Get site information
   */
  async getSiteInfo() {
    if (this.useMockData) {
      return this.getMockSiteInfo();
    }

    try {
      console.log('[SharePoint] Fetching site info...');
      
      const site = await this.client
        .api(`/sites/${this.extractSiteId()}`)
        .get();
      
      return {
        id: site.id,
        name: site.displayName,
        webUrl: site.webUrl,
        description: site.description || 'No description'
      };
    } catch (error) {
      console.error('[SharePoint] Error getting site info:', error.message);
      throw error;
    }
  }

  /**
   * List documents in a library
   */
  async listDocuments(libraryName = 'Documents') {
    if (this.useMockData) {
      return this.getMockDocuments();
    }

    try {
      console.log(`[SharePoint] Listing documents from library: ${libraryName}`);
      
      const items = await this.client
        .api(`/sites/${this.extractSiteId()}/drive/root/children`)
        .get();
      
      return items.value.map(item => ({
        id: item.id,
        name: item.name,
        size: item.size,
        createdDateTime: item.createdDateTime,
        modifiedDateTime: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        isFolder: !!item.folder,
        createdBy: item.createdBy?.user?.displayName || 'Unknown',
        modifiedBy: item.lastModifiedBy?.user?.displayName || 'Unknown'
      }));
    } catch (error) {
      console.error('[SharePoint] Error listing documents:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocument(documentId) {
    if (this.useMockData) {
      return this.getMockDocuments().find(doc => doc.id === documentId);
    }

    try {
      console.log(`[SharePoint] Getting document: ${documentId}`);
      
      const item = await this.client
        .api(`/sites/${this.extractSiteId()}/drive/items/${documentId}`)
        .get();
      
      return {
        id: item.id,
        name: item.name,
        size: item.size,
        createdDateTime: item.createdDateTime,
        modifiedDateTime: item.lastModifiedDateTime,
        webUrl: item.webUrl,
        isFolder: !!item.folder,
        downloadUrl: item['@microsoft.graph.downloadUrl']
      };
    } catch (error) {
      console.error('[SharePoint] Error getting document:', error.message);
      throw error;
    }
  }

  /**
   * Upload a document
   */
  async uploadDocument(fileName, content, folderPath = '') {
    if (this.useMockData) {
      return this.getMockUploadResult(fileName);
    }

    try {
      console.log(`[SharePoint] Uploading document: ${fileName}`);
      
      const path = folderPath ? `${folderPath}/${fileName}` : fileName;
      
      const uploadedFile = await this.client
        .api(`/sites/${this.extractSiteId()}/drive/root:/${path}:/content`)
        .put(content);
      
      return {
        id: uploadedFile.id,
        name: uploadedFile.name,
        webUrl: uploadedFile.webUrl,
        size: uploadedFile.size
      };
    } catch (error) {
      console.error('[SharePoint] Error uploading document:', error.message);
      throw error;
    }
  }

  /**
   * Create a folder
   */
  async createFolder(folderName, parentPath = '') {
    if (this.useMockData) {
      return this.getMockFolderResult(folderName);
    }

    try {
      console.log(`[SharePoint] Creating folder: ${folderName}`);
      
      const folder = {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename'
      };

      const parentApi = parentPath 
        ? `/sites/${this.extractSiteId()}/drive/root:/${parentPath}:/children`
        : `/sites/${this.extractSiteId()}/drive/root/children`;

      const createdFolder = await this.client
        .api(parentApi)
        .post(folder);
      
      return {
        id: createdFolder.id,
        name: createdFolder.name,
        webUrl: createdFolder.webUrl
      };
    } catch (error) {
      console.error('[SharePoint] Error creating folder:', error.message);
      throw error;
    }
  }

  /**
   * Check connection health
   */
  async isHealthy() {
    try {
      await this.getSiteInfo();
      return true;
    } catch (error) {
      console.error('[SharePoint] Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Extract site ID from URL
   * Format: hostname:/sites/sitename
   */
  extractSiteId() {
    const url = new URL(this.siteUrl);
    const hostname = url.hostname;
    const sitePath = url.pathname;
    return `${hostname}:${sitePath}`;
  }

  // ============================================
  // MOCK DATA METHODS (for development)
  // ============================================

  getMockSiteInfo() {
    console.log('[SharePoint] Using MOCK site info');
    return {
      id: 'mock-site-id-12345',
      name: 'Dynamics 365 Project Team',
      webUrl: this.siteUrl,
      description: 'Site SharePoint pour l\'équipe Dynamics 365 (MOCK DATA)'
    };
  }

  getMockDocuments() {
    console.log('[SharePoint] Using MOCK documents');
    return [
      {
        id: 'mock-doc-1',
        name: 'Template_CR_MEP.docx',
        size: 45678,
        createdDateTime: '2024-01-15T10:00:00Z',
        modifiedDateTime: '2024-01-20T14:30:00Z',
        webUrl: `${this.siteUrl}/Documents/Template_CR_MEP.docx`,
        isFolder: false,
        createdBy: 'John Doe',
        modifiedBy: 'Jane Smith'
      },
      {
        id: 'mock-doc-2',
        name: 'Rapports',
        size: 0,
        createdDateTime: '2024-01-10T09:00:00Z',
        modifiedDateTime: '2024-01-25T16:45:00Z',
        webUrl: `${this.siteUrl}/Documents/Rapports`,
        isFolder: true,
        createdBy: 'Admin',
        modifiedBy: 'Admin'
      },
      {
        id: 'mock-doc-3',
        name: 'CR_MEP_12.0.8.pdf',
        size: 234567,
        createdDateTime: '2024-01-22T11:15:00Z',
        modifiedDateTime: '2024-01-22T11:15:00Z',
        webUrl: `${this.siteUrl}/Documents/Rapports/CR_MEP_12.0.8.pdf`,
        isFolder: false,
        createdBy: 'System',
        modifiedBy: 'System'
      },
      {
        id: 'mock-doc-4',
        name: 'Templates',
        size: 0,
        createdDateTime: '2024-01-05T08:00:00Z',
        modifiedDateTime: '2024-01-18T10:20:00Z',
        webUrl: `${this.siteUrl}/Documents/Templates`,
        isFolder: true,
        createdBy: 'Admin',
        modifiedBy: 'John Doe'
      },
      {
        id: 'mock-doc-5',
        name: 'Guide_Utilisation_RMM.pdf',
        size: 1234567,
        createdDateTime: '2024-01-12T14:00:00Z',
        modifiedDateTime: '2024-01-19T09:30:00Z',
        webUrl: `${this.siteUrl}/Documents/Guide_Utilisation_RMM.pdf`,
        isFolder: false,
        createdBy: 'Jane Smith',
        modifiedBy: 'Jane Smith'
      }
    ];
  }

  getMockUploadResult(fileName) {
    console.log(`[SharePoint] MOCK upload: ${fileName}`);
    return {
      id: `mock-upload-${Date.now()}`,
      name: fileName,
      webUrl: `${this.siteUrl}/Documents/${fileName}`,
      size: 12345
    };
  }

  getMockFolderResult(folderName) {
    console.log(`[SharePoint] MOCK create folder: ${folderName}`);
    return {
      id: `mock-folder-${Date.now()}`,
      name: folderName,
      webUrl: `${this.siteUrl}/Documents/${folderName}`
    };
  }
}
