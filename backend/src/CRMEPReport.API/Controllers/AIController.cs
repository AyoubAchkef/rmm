using CRMEPReport.API.Models.AI;
using CRMEPReport.API.Services.AI;
using Microsoft.AspNetCore.Mvc;

namespace CRMEPReport.API.Controllers;

/// <summary>
/// AI Controller
/// Handles AI-powered report generation, section completion, and chat
/// </summary>
[ApiController]
[Route("api/ai")]
[Produces("application/json")]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly IMCPService _mcpService;
    private readonly ILogger<AIController> _logger;

    public AIController(
        IAIService aiService,
        IMCPService mcpService,
        ILogger<AIController> logger)
    {
        _aiService = aiService;
        _mcpService = mcpService;
        _logger = logger;
    }

    /// <summary>
    /// Generate a complete report using AI and Azure DevOps data
    /// </summary>
    /// <param name="request">Generation request with prompt and context</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Generated report data</returns>
    /// <response code="200">Report generated successfully</response>
    /// <response code="400">Invalid request</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("generate-report")]
    [ProducesResponseType(typeof(GenerateReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<GenerateReportResponse>> GenerateReport(
        [FromBody] GenerateReportRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received request to generate report");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _aiService.GenerateReportAsync(request, cancellationToken);
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report");
            return StatusCode(500, new { error = "An error occurred while generating the report" });
        }
    }

    /// <summary>
    /// Complete a specific section of a report
    /// </summary>
    /// <param name="request">Section completion request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completed section content</returns>
    /// <response code="200">Section completed successfully</response>
    /// <response code="400">Invalid request</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("complete-section")]
    [ProducesResponseType(typeof(CompleteSectionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CompleteSectionResponse>> CompleteSection(
        [FromBody] CompleteSectionRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received request to complete section: {SectionName}", request.SectionName);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _aiService.CompleteSectionAsync(request, cancellationToken);
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing section");
            return StatusCode(500, new { error = "An error occurred while completing the section" });
        }
    }

    /// <summary>
    /// Chat with AI assistant
    /// </summary>
    /// <param name="request">Chat request with message and history</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>AI response</returns>
    /// <response code="200">Chat response generated successfully</response>
    /// <response code="400">Invalid request</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("chat")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ChatResponse>> Chat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received chat message");

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _aiService.ChatAsync(request, cancellationToken);
            
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat");
            return StatusCode(500, new { error = "An error occurred while processing the chat" });
        }
    }

    /// <summary>
    /// Stream chat response for real-time UI updates
    /// </summary>
    /// <param name="request">Chat request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Server-Sent Events stream</returns>
    /// <response code="200">Streaming started</response>
    /// <response code="400">Invalid request</response>
    [HttpPost("chat/stream")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task StreamChat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Received streaming chat request");

            if (!ModelState.IsValid)
            {
                Response.StatusCode = 400;
                return;
            }

            Response.Headers.Append("Content-Type", "text/event-stream");
            Response.Headers.Append("Cache-Control", "no-cache");
            Response.Headers.Append("Connection", "keep-alive");

            await foreach (var chunk in _aiService.StreamChatAsync(request, cancellationToken))
            {
                await Response.WriteAsync($"data: {chunk}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming chat");
        }
    }

    /// <summary>
    /// Get Azure DevOps context for a release version
    /// </summary>
    /// <param name="version">Release version</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Azure DevOps context</returns>
    /// <response code="200">Context retrieved successfully</response>
    /// <response code="404">Version not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("devops/release/{version}")]
    [ProducesResponseType(typeof(AzureDevOpsContext), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AzureDevOpsContext>> GetReleaseContext(
        string version,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching Azure DevOps context for version: {Version}", version);

            var context = await _mcpService.GetReleaseContextAsync(version, cancellationToken);
            
            if (context == null)
            {
                return NotFound(new { error = $"No context found for version {version}" });
            }

            return Ok(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching release context");
            return StatusCode(500, new { error = "An error occurred while fetching the context" });
        }
    }

    /// <summary>
    /// Get Azure DevOps context for a sprint
    /// </summary>
    /// <param name="sprint">Sprint name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Azure DevOps context</returns>
    /// <response code="200">Context retrieved successfully</response>
    /// <response code="404">Sprint not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("devops/sprint/{sprint}")]
    [ProducesResponseType(typeof(AzureDevOpsContext), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<AzureDevOpsContext>> GetSprintContext(
        string sprint,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Fetching Azure DevOps context for sprint: {Sprint}", sprint);

            var context = await _mcpService.GetSprintContextAsync(sprint, cancellationToken);
            
            if (context == null)
            {
                return NotFound(new { error = $"No context found for sprint {sprint}" });
            }

            return Ok(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching sprint context");
            return StatusCode(500, new { error = "An error occurred while fetching the context" });
        }
    }

    /// <summary>
    /// Check MCP server health
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Health status</returns>
    /// <response code="200">MCP server is healthy</response>
    /// <response code="503">MCP server is unavailable</response>
    [HttpGet("mcp/health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult> CheckMCPHealth(CancellationToken cancellationToken)
    {
        try
        {
            var isHealthy = await _mcpService.IsHealthyAsync(cancellationToken);
            
            if (isHealthy)
            {
                return Ok(new { status = "healthy", message = "MCP server is available" });
            }

            return StatusCode(503, new { status = "unhealthy", message = "MCP server is unavailable" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking MCP health");
            return StatusCode(503, new { status = "error", message = ex.Message });
        }
    }

    /// <summary>
    /// Get available MCP tools
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of available tools</returns>
    /// <response code="200">Tools retrieved successfully</response>
    [HttpGet("mcp/tools")]
    [ProducesResponseType(typeof(List<string>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<string>>> GetMCPTools(CancellationToken cancellationToken)
    {
        try
        {
            var tools = await _mcpService.GetAvailableToolsAsync(cancellationToken);
            return Ok(tools);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching MCP tools");
            return Ok(new List<string>());
        }
    }
}
