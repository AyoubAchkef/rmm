using System.Net.Http.Json;
using System.Text.Json;
using CRMEPReport.API.Models.AI;
using Microsoft.Extensions.Options;

namespace CRMEPReport.API.Services.AI;

/// <summary>
/// MCP (Model Context Protocol) Service Implementation
/// Communicates with the MCP server to fetch Azure DevOps data
/// </summary>
public class MCPService : IMCPService
{
    private readonly HttpClient _httpClient;
    private readonly MCPOptions _options;
    private readonly ILogger<MCPService> _logger;

    public MCPService(
        HttpClient httpClient,
        IOptions<MCPOptions> options,
        ILogger<MCPService> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        // Configure HttpClient base address
        if (!string.IsNullOrEmpty(_options.ServerUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.ServerUrl);
        }
    }

    /// <inheritdoc />
    public async Task<AzureDevOpsContext> GetReleaseContextAsync(
        string version,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Fetching Azure DevOps context for release version: {Version}", version);

            if (!_options.Enabled)
            {
                _logger.LogWarning("MCP is disabled. Returning mock data.");
                return GetMockContext(version);
            }

            // Call MCP server endpoint
            var request = new
            {
                tool = "get_release_context",
                parameters = new { version }
            };

            var response = await _httpClient.PostAsJsonAsync("/api/mcp/execute", request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var context = await response.Content.ReadFromJsonAsync<AzureDevOpsContext>(cancellationToken);
            
            _logger.LogInformation("Successfully fetched context for version {Version}", version);
            
            return context ?? GetMockContext(version);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching release context for version {Version}", version);
            
            // Return mock data on error for development
            return GetMockContext(version);
        }
    }

    /// <inheritdoc />
    public async Task<AzureDevOpsContext> GetSprintContextAsync(
        string sprint,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Fetching Azure DevOps context for sprint: {Sprint}", sprint);

            if (!_options.Enabled)
            {
                _logger.LogWarning("MCP is disabled. Returning mock data.");
                return GetMockContextForSprint(sprint);
            }

            var request = new
            {
                tool = "get_sprint_context",
                parameters = new { sprint }
            };

            var response = await _httpClient.PostAsJsonAsync("/api/mcp/execute", request, cancellationToken);
            response.EnsureSuccessStatusCode();

            var context = await response.Content.ReadFromJsonAsync<AzureDevOpsContext>(cancellationToken);
            
            _logger.LogInformation("Successfully fetched context for sprint {Sprint}", sprint);
            
            return context ?? GetMockContextForSprint(sprint);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching sprint context for {Sprint}", sprint);
            return GetMockContextForSprint(sprint);
        }
    }

    /// <inheritdoc />
    public async Task<string> ExecuteQueryAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Executing MCP query: {Query}", query);

            if (!_options.Enabled)
            {
                return "{}";
            }

            var request = new { query };
            var response = await _httpClient.PostAsJsonAsync("/api/mcp/query", request, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing MCP query");
            return "{}";
        }
    }

    /// <inheritdoc />
    public async Task<bool> IsHealthyAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (!_options.Enabled)
            {
                return false;
            }

            var response = await _httpClient.GetAsync("/health", cancellationToken);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc />
    public async Task<List<string>> GetAvailableToolsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            if (!_options.Enabled)
            {
                return new List<string>();
            }

            var response = await _httpClient.GetAsync("/api/mcp/tools", cancellationToken);
            response.EnsureSuccessStatusCode();

            var tools = await response.Content.ReadFromJsonAsync<List<string>>(cancellationToken);
            return tools ?? new List<string>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching available MCP tools");
            return new List<string>();
        }
    }

    /// <summary>
    /// Get mock context for development/testing
    /// </summary>
    private AzureDevOpsContext GetMockContext(string version)
    {
        return new AzureDevOpsContext
        {
            Release = new ReleaseInfo
            {
                Version = version,
                Sprint = "Sprint 45",
                ReleaseDate = DateTime.Now.AddDays(-2),
                Status = "Completed",
                Packages = new List<string> { $"Package_{version}" }
            },
            WorkItems = new List<WorkItem>
            {
                new WorkItem
                {
                    Id = 12345,
                    Title = "Implement new feature X",
                    Type = "Feature",
                    State = "Done",
                    AssignedTo = "John Doe",
                    Description = "Implementation of feature X with all requirements",
                    CompletedDate = DateTime.Now.AddDays(-3),
                    Tags = new List<string> { "feature", "high-priority" }
                },
                new WorkItem
                {
                    Id = 12346,
                    Title = "Fix critical bug in module Y",
                    Type = "Bug",
                    State = "Done",
                    AssignedTo = "Jane Smith",
                    Description = "Critical bug causing system crash",
                    CompletedDate = DateTime.Now.AddDays(-1),
                    Tags = new List<string> { "bug", "critical" }
                }
            },
            Tests = new TestResults
            {
                TotalTests = 150,
                PassedTests = 148,
                FailedTests = 2,
                SkippedTests = 0,
                PassRate = 98.67,
                FailedTestCases = new List<TestCase>
                {
                    new TestCase
                    {
                        Name = "Test_ModuleY_EdgeCase",
                        Status = "Failed",
                        ErrorMessage = "Assertion failed: Expected 10, got 9"
                    }
                }
            },
            Deployment = new DeploymentInfo
            {
                Environment = "Production",
                DeploymentDate = DateTime.Now.AddDays(-1),
                Status = "Success",
                DeployedBy = "DevOps Pipeline",
                Environments = new List<string> { "DEV", "QA", "UAT", "PROD" }
            }
        };
    }

    /// <summary>
    /// Get mock context for sprint
    /// </summary>
    private AzureDevOpsContext GetMockContextForSprint(string sprint)
    {
        return GetMockContext("12.0.8");
    }
}

/// <summary>
/// MCP configuration options
/// </summary>
public class MCPOptions
{
    /// <summary>
    /// MCP server URL
    /// </summary>
    public string ServerUrl { get; set; } = "http://localhost:3001";

    /// <summary>
    /// Whether MCP is enabled
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Request timeout in seconds
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Azure DevOps organization
    /// </summary>
    public string? Organization { get; set; }

    /// <summary>
    /// Azure DevOps project
    /// </summary>
    public string? Project { get; set; }
}
