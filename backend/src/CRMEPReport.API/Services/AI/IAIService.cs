using CRMEPReport.API.Models.AI;

namespace CRMEPReport.API.Services.AI;

/// <summary>
/// Interface for AI services (OpenAI integration)
/// Handles report generation, section completion, and conversational chat
/// </summary>
public interface IAIService
{
    /// <summary>
    /// Generate a complete report based on natural language prompt and Azure DevOps data
    /// </summary>
    /// <param name="request">Generation request with prompt and context</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Generated report data</returns>
    Task<GenerateReportResponse> GenerateReportAsync(
        GenerateReportRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Complete a specific section of a report
    /// </summary>
    /// <param name="request">Section completion request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Completed section content</returns>
    Task<CompleteSectionResponse> CompleteSectionAsync(
        CompleteSectionRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Handle conversational chat with context awareness
    /// </summary>
    /// <param name="request">Chat request with message and history</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>AI response</returns>
    Task<ChatResponse> ChatAsync(
        ChatRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stream chat response for real-time UI updates
    /// </summary>
    /// <param name="request">Chat request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Async enumerable of response chunks</returns>
    IAsyncEnumerable<string> StreamChatAsync(
        ChatRequest request,
        CancellationToken cancellationToken = default);
}
