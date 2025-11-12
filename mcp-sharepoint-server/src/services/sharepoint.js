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
    
    // Initialize credential for Microsoft Graph API
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

  /**
   * Get site information
   */
  async getSiteInfo() {
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
}
