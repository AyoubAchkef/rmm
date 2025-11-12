using System.ComponentModel.DataAnnotations;

namespace CRMEPReport.API.Models.AI;

/// <summary>
/// Request to generate a complete report using AI
/// </summary>
public class GenerateReportRequest
{
    /// <summary>
    /// Natural language prompt from the user
    /// Example: "La MEP de la 12.0.8 est terminée, génère moi le CR MEP stp"
    /// </summary>
    [Required(ErrorMessage = "Prompt is required")]
    [MaxLength(1000, ErrorMessage = "Prompt cannot exceed 1000 characters")]
    public string Prompt { get; set; } = string.Empty;

    /// <summary>
    /// Release version to fetch data from Azure DevOps
    /// Example: "12.0.8"
    /// </summary>
    [MaxLength(50)]
    public string? Version { get; set; }

    /// <summary>
    /// Sprint name to fetch data from Azure DevOps
    /// Example: "Sprint 45"
    /// </summary>
    [MaxLength(100)]
    public string? Sprint { get; set; }

    /// <summary>
    /// Whether to include Azure DevOps data in the generation
    /// </summary>
    public bool IncludeAzureDevOpsData { get; set; } = true;

    /// <summary>
    /// Additional context for the AI
    /// </summary>
    public Dictionary<string, string>? AdditionalContext { get; set; }
}

/// <summary>
/// Request to complete a specific section of a report
/// </summary>
public class CompleteSectionRequest
{
    /// <summary>
    /// ID of the report being edited
    /// </summary>
    [Required(ErrorMessage = "Report ID is required")]
    public string ReportId { get; set; } = string.Empty;

    /// <summary>
    /// Name of the section to complete
    /// Example: "conclusion", "objectifs", "perimetre"
    /// </summary>
    [Required(ErrorMessage = "Section name is required")]
    [MaxLength(100)]
    public string SectionName { get; set; } = string.Empty;

    /// <summary>
    /// Current content of the section (if any)
    /// </summary>
    public string? CurrentContent { get; set; }

    /// <summary>
    /// Natural language instruction
    /// Example: "Remplie moi la conclusion du rapport"
    /// </summary>
    [MaxLength(500)]
    public string? Instruction { get; set; }

    /// <summary>
    /// Whether to include Azure DevOps context
    /// </summary>
    public bool IncludeAzureDevOpsContext { get; set; } = true;
}

/// <summary>
/// Request for conversational chat with AI
/// </summary>
public class ChatRequest
{
    /// <summary>
    /// User message
    /// </summary>
    [Required(ErrorMessage = "Message is required")]
    [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Conversation history for context
    /// </summary>
    public List<ChatMessage>? History { get; set; }

    /// <summary>
    /// Current report context (if chatting from create/edit page)
    /// </summary>
    public string? ReportId { get; set; }

    /// <summary>
    /// Current report data as JSON (if available)
    /// </summary>
    public string? CurrentReportData { get; set; }
}

/// <summary>
/// Single chat message
/// </summary>
public class ChatMessage
{
    /// <summary>
    /// Message role: "user" or "assistant"
    /// </summary>
    [Required]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Message content
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Message timestamp
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Response from AI report generation
/// </summary>
public class GenerateReportResponse
{
    /// <summary>
    /// Generated report data as JSON
    /// </summary>
    public string ReportDataJson { get; set; } = string.Empty;

    /// <summary>
    /// Suggested package name
    /// </summary>
    public string? SuggestedPackage { get; set; }

    /// <summary>
    /// Suggested sprint name
    /// </summary>
    public string? SuggestedSprint { get; set; }

    /// <summary>
    /// Suggested deployment date
    /// </summary>
    public DateTime? SuggestedDeploymentDate { get; set; }

    /// <summary>
    /// Azure DevOps data used for generation
    /// </summary>
    public AzureDevOpsContext? AzureDevOpsContext { get; set; }

    /// <summary>
    /// AI model used
    /// </summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Tokens used for generation
    /// </summary>
    public int TokensUsed { get; set; }
}

/// <summary>
/// Response from section completion
/// </summary>
public class CompleteSectionResponse
{
    /// <summary>
    /// Completed section content
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// AI model used
    /// </summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Tokens used
    /// </summary>
    public int TokensUsed { get; set; }
}

/// <summary>
/// Response from chat
/// </summary>
public class ChatResponse
{
    /// <summary>
    /// AI response message
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Suggested actions (if any)
    /// </summary>
    public List<SuggestedAction>? SuggestedActions { get; set; }

    /// <summary>
    /// AI model used
    /// </summary>
    public string Model { get; set; } = string.Empty;

    /// <summary>
    /// Tokens used
    /// </summary>
    public int TokensUsed { get; set; }
}

/// <summary>
/// Suggested action from AI
/// </summary>
public class SuggestedAction
{
    /// <summary>
    /// Action type: "generate_report", "complete_section", "open_report", etc.
    /// </summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>
    /// Action label to display
    /// </summary>
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// Action parameters
    /// </summary>
    public Dictionary<string, string>? Parameters { get; set; }
}

/// <summary>
/// Azure DevOps context from MCP
/// </summary>
public class AzureDevOpsContext
{
    /// <summary>
    /// Release information
    /// </summary>
    public ReleaseInfo? Release { get; set; }

    /// <summary>
    /// Work items (features, bugs, tasks)
    /// </summary>
    public List<WorkItem>? WorkItems { get; set; }

    /// <summary>
    /// Test results
    /// </summary>
    public TestResults? Tests { get; set; }

    /// <summary>
    /// Deployment information
    /// </summary>
    public DeploymentInfo? Deployment { get; set; }
}

/// <summary>
/// Release information from Azure DevOps
/// </summary>
public class ReleaseInfo
{
    public string Version { get; set; } = string.Empty;
    public string Sprint { get; set; } = string.Empty;
    public DateTime ReleaseDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Packages { get; set; } = new();
}

/// <summary>
/// Work item from Azure DevOps
/// </summary>
public class WorkItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Bug, Task, User Story, Feature
    public string State { get; set; } = string.Empty;
    public string? AssignedTo { get; set; }
    public string? Description { get; set; }
    public DateTime? CompletedDate { get; set; }
    public List<string> Tags { get; set; } = new();
}

/// <summary>
/// Test results from Azure DevOps
/// </summary>
public class TestResults
{
    public int TotalTests { get; set; }
    public int PassedTests { get; set; }
    public int FailedTests { get; set; }
    public int SkippedTests { get; set; }
    public double PassRate { get; set; }
    public List<TestCase>? FailedTestCases { get; set; }
}

/// <summary>
/// Individual test case
/// </summary>
public class TestCase
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ErrorMessage { get; set; }
}

/// <summary>
/// Deployment information
/// </summary>
public class DeploymentInfo
{
    public string Environment { get; set; } = string.Empty;
    public DateTime DeploymentDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? DeployedBy { get; set; }
    public List<string> Environments { get; set; } = new();
}
