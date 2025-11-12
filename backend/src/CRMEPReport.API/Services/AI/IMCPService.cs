using CRMEPReport.API.Models.AI;

namespace CRMEPReport.API.Services.AI;

/// <summary>
/// Interface for MCP (Model Context Protocol) service
/// Handles communication with Azure DevOps via MCP server
/// </summary>
public interface IMCPService
{
    /// <summary>
    /// Get Azure DevOps context for a specific release version
    /// </summary>
    /// <param name="version">Release version (e.g., "12.0.8")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Azure DevOps context with release, work items, tests, etc.</returns>
    Task<AzureDevOpsContext> GetReleaseContextAsync(
        string version,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get Azure DevOps context for a specific sprint
    /// </summary>
    /// <param name="sprint">Sprint name (e.g., "Sprint 45")</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Azure DevOps context</returns>
    Task<AzureDevOpsContext> GetSprintContextAsync(
        string sprint,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Execute a custom MCP query
    /// </summary>
    /// <param name="query">MCP query string</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Query result as JSON string</returns>
    Task<string> ExecuteQueryAsync(
        string query,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if MCP server is available and healthy
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if MCP server is healthy</returns>
    Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Get available MCP tools/capabilities
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of available tools</returns>
    Task<List<string>> GetAvailableToolsAsync(CancellationToken cancellationToken = default);
}
