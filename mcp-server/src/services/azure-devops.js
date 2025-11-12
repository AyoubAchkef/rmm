/**
 * Azure DevOps Service
 * Handles all interactions with Azure DevOps REST API
 */

import * as azdev from 'azure-devops-node-api';

export class AzureDevOpsService {
  constructor(config) {
    this.orgUrl = config.orgUrl;
    this.token = config.token;
    this.project = config.project;
    
    // Initialize Azure DevOps connection
    const authHandler = azdev.getPersonalAccessTokenHandler(this.token);
    this.connection = new azdev.WebApi(this.orgUrl, authHandler);
  }

  /**
   * Get release context for a specific version
   * @param {string} version - Release version (e.g., "12.0.8")
   * @returns {Promise<Object>} Release context with work items, tests, deployment info
   */
  async getReleaseContext(version) {
    try {
      console.log(`[Azure DevOps] Fetching release context for version: ${version}`);

      // Get work item tracking API
      const witApi = await this.connection.getWorkItemTrackingApi();
      
      // Get build API
      const buildApi = await this.connection.getBuildApi();

      // Search for work items related to this version
      const wiql = {
        query: `
          SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], 
                 [System.AssignedTo], [System.Description], [System.Tags]
          FROM WorkItems
          WHERE [System.Tags] CONTAINS '${version}'
             OR [System.Title] CONTAINS '${version}'
          ORDER BY [System.ChangedDate] DESC
        `
      };

      const queryResult = await witApi.queryByWiql(wiql, { project: this.project });
      
      // Get work item details
      const workItems = [];
      if (queryResult.workItems && queryResult.workItems.length > 0) {
        const ids = queryResult.workItems.map(wi => wi.id);
        const workItemDetails = await witApi.getWorkItems(ids, undefined, undefined, undefined, undefined);
        
        for (const wi of workItemDetails) {
          workItems.push({
            id: wi.id,
            title: wi.fields['System.Title'],
            type: wi.fields['System.WorkItemType'],
            state: wi.fields['System.State'],
            assignedTo: wi.fields['System.AssignedTo']?.displayName,
            description: wi.fields['System.Description'],
            completedDate: wi.fields['Microsoft.VSTS.Common.ClosedDate'],
            tags: wi.fields['System.Tags']?.split(';').map(t => t.trim()) || []
          });
        }
      }

      // Get latest builds
      const builds = await buildApi.getBuilds(
        this.project,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        5 // Get last 5 builds
      );

      // Get test results for the latest build
      let testResults = null;
      if (builds && builds.length > 0) {
        const latestBuild = builds[0];
        const testApi = await this.connection.getTestApi();
        
        try {
          const testRuns = await testApi.getTestRuns(this.project, latestBuild.id.toString());
          
          if (testRuns && testRuns.length > 0) {
            const testRun = testRuns[0];
            const testRunStats = await testApi.getTestRunStatistics(this.project, testRun.id);
            
            testResults = {
              totalTests: testRunStats.run?.totalTests || 0,
              passedTests: testRunStats.run?.passedTests || 0,
              failedTests: testRunStats.run?.failedTests || 0,
              skippedTests: testRunStats.run?.notApplicableTests || 0,
              passRate: testRunStats.run?.passedTests && testRunStats.run?.totalTests
                ? (testRunStats.run.passedTests / testRunStats.run.totalTests * 100).toFixed(2)
                : 0
            };
          }
        } catch (error) {
          console.warn('[Azure DevOps] Could not fetch test results:', error.message);
        }
      }

      // Build release context
      const context = {
        release: {
          version: version,
          sprint: this.extractSprintFromWorkItems(workItems),
          releaseDate: new Date().toISOString(),
          status: 'Completed',
          packages: [`Package_${version}`]
        },
        workItems: workItems,
        tests: testResults || {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          passRate: 0
        },
        deployment: {
          environment: 'Production',
          deploymentDate: new Date().toISOString(),
          status: 'Success',
          deployedBy: 'DevOps Pipeline',
          environments: ['DEV', 'QA', 'UAT', 'PROD']
        }
      };

      console.log(`[Azure DevOps] Successfully fetched context for version: ${version}`);
      console.log(`[Azure DevOps] Found ${workItems.length} work items`);

      return context;
    } catch (error) {
      console.error('[Azure DevOps] Error fetching release context:', error);
      throw error;
    }
  }

  /**
   * Get sprint context
   * @param {string} sprint - Sprint name (e.g., "Sprint 45")
   * @returns {Promise<Object>} Sprint context
   */
  async getSprintContext(sprint) {
    try {
      console.log(`[Azure DevOps] Fetching sprint context for: ${sprint}`);

      const witApi = await this.connection.getWorkItemTrackingApi();

      // Query work items for this sprint
      const wiql = {
        query: `
          SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], 
                 [System.AssignedTo], [System.Description], [System.Tags]
          FROM WorkItems
          WHERE [System.IterationPath] CONTAINS '${sprint}'
          ORDER BY [System.ChangedDate] DESC
        `
      };

      const queryResult = await witApi.queryByWiql(wiql, { project: this.project });
      
      const workItems = [];
      if (queryResult.workItems && queryResult.workItems.length > 0) {
        const ids = queryResult.workItems.map(wi => wi.id);
        const workItemDetails = await witApi.getWorkItems(ids, undefined, undefined, undefined, undefined);
        
        for (const wi of workItemDetails) {
          workItems.push({
            id: wi.id,
            title: wi.fields['System.Title'],
            type: wi.fields['System.WorkItemType'],
            state: wi.fields['System.State'],
            assignedTo: wi.fields['System.AssignedTo']?.displayName,
            description: wi.fields['System.Description'],
            completedDate: wi.fields['Microsoft.VSTS.Common.ClosedDate'],
            tags: wi.fields['System.Tags']?.split(';').map(t => t.trim()) || []
          });
        }
      }

      const context = {
        release: {
          version: 'Latest',
          sprint: sprint,
          releaseDate: new Date().toISOString(),
          status: 'In Progress',
          packages: []
        },
        workItems: workItems,
        tests: null,
        deployment: null
      };

      console.log(`[Azure DevOps] Successfully fetched context for sprint: ${sprint}`);
      console.log(`[Azure DevOps] Found ${workItems.length} work items`);

      return context;
    } catch (error) {
      console.error('[Azure DevOps] Error fetching sprint context:', error);
      throw error;
    }
  }

  /**
   * Get specific work items by IDs
   * @param {number[]} ids - Work item IDs
   * @returns {Promise<Object[]>} Work items
   */
  async getWorkItems(ids) {
    try {
      console.log(`[Azure DevOps] Fetching work items: ${ids.join(', ')}`);

      const witApi = await this.connection.getWorkItemTrackingApi();
      const workItemDetails = await witApi.getWorkItems(ids, undefined, undefined, undefined, undefined);
      
      const workItems = workItemDetails.map(wi => ({
        id: wi.id,
        title: wi.fields['System.Title'],
        type: wi.fields['System.WorkItemType'],
        state: wi.fields['System.State'],
        assignedTo: wi.fields['System.AssignedTo']?.displayName,
        description: wi.fields['System.Description'],
        completedDate: wi.fields['Microsoft.VSTS.Common.ClosedDate'],
        tags: wi.fields['System.Tags']?.split(';').map(t => t.trim()) || []
      }));

      console.log(`[Azure DevOps] Successfully fetched ${workItems.length} work items`);

      return workItems;
    } catch (error) {
      console.error('[Azure DevOps] Error fetching work items:', error);
      throw error;
    }
  }

  /**
   * Extract sprint name from work items
   * @private
   */
  extractSprintFromWorkItems(workItems) {
    // Try to find sprint in tags or use default
    for (const wi of workItems) {
      const sprintTag = wi.tags.find(tag => tag.toLowerCase().includes('sprint'));
      if (sprintTag) {
        return sprintTag;
      }
    }
    return 'Sprint 45'; // Default
  }

  /**
   * Check if Azure DevOps connection is healthy
   * @returns {Promise<boolean>}
   */
  async isHealthy() {
    try {
      const coreApi = await this.connection.getCoreApi();
      await coreApi.getProjects();
      return true;
    } catch (error) {
      console.error('[Azure DevOps] Health check failed:', error);
      return false;
    }
  }
}
