/**
 * MCP Server Implementation
 * Provides Model Context Protocol tools for Azure DevOps
 */

export class MCPServer {
  constructor(azureDevOpsService) {
    this.azureDevOpsService = azureDevOpsService;
    
    // Define available tools
    this.tools = {
      get_release_context: {
        name: 'get_release_context',
        description: 'Get comprehensive context for a release version including work items, tests, and deployment info',
        parameters: {
          version: {
            type: 'string',
            description: 'Release version (e.g., "12.0.8")',
            required: true
          }
        }
      },
      get_sprint_context: {
        name: 'get_sprint_context',
        description: 'Get context for a sprint including all work items',
        parameters: {
          sprint: {
            type: 'string',
            description: 'Sprint name (e.g., "Sprint 45")',
            required: true
          }
        }
      },
      get_work_items: {
        name: 'get_work_items',
        description: 'Get specific work items by their IDs',
        parameters: {
          ids: {
            type: 'array',
            description: 'Array of work item IDs',
            required: true
          }
        }
      }
    };
  }

  /**
   * Execute a tool with given parameters
   * @param {string} toolName - Name of the tool to execute
   * @param {Object} parameters - Tool parameters
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(toolName, parameters) {
    console.log(`[MCP Server] Executing tool: ${toolName}`);

    if (!this.tools[toolName]) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    switch (toolName) {
      case 'get_release_context':
        return await this.azureDevOpsService.getReleaseContext(parameters.version);
      
      case 'get_sprint_context':
        return await this.azureDevOpsService.getSprintContext(parameters.sprint);
      
      case 'get_work_items':
        return await this.azureDevOpsService.getWorkItems(parameters.ids);
      
      default:
        throw new Error(`Tool not implemented: ${toolName}`);
    }
  }

  /**
   * Execute a custom query
   * @param {string} query - Query string
   * @returns {Promise<Object>} Query result
   */
  async executeQuery(query) {
    console.log(`[MCP Server] Executing query: ${query}`);
    
    // Parse query and execute appropriate tool
    // This is a simple implementation - can be enhanced with a query parser
    
    if (query.includes('release') || query.includes('version')) {
      // Extract version from query
      const versionMatch = query.match(/\d+\.\d+\.\d+/);
      if (versionMatch) {
        return await this.azureDevOpsService.getReleaseContext(versionMatch[0]);
      }
    }
    
    if (query.includes('sprint')) {
      // Extract sprint from query
      const sprintMatch = query.match(/sprint\s+\d+/i);
      if (sprintMatch) {
        return await this.azureDevOpsService.getSprintContext(sprintMatch[0]);
      }
    }
    
    throw new Error('Could not parse query');
  }

  /**
   * Get list of available tools
   * @returns {string[]} Tool names
   */
  getAvailableTools() {
    return Object.keys(this.tools);
  }

  /**
   * Get tool definition
   * @param {string} toolName - Tool name
   * @returns {Object} Tool definition
   */
  getToolDefinition(toolName) {
    return this.tools[toolName];
  }

  /**
   * Get all tool definitions
   * @returns {Object} All tools
   */
  getAllToolDefinitions() {
    return this.tools;
  }
}
