using System.Runtime.CompilerServices;
using System.Text.Json;
using Azure;
using Azure.AI.OpenAI;
using CRMEPReport.API.Models.AI;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using OpenAIChatMessage = OpenAI.Chat.ChatMessage;

namespace CRMEPReport.API.Services.AI;

/// <summary>
/// OpenAI Service Implementation
/// Handles AI-powered report generation, section completion, and chat
/// </summary>
public class OpenAIService : IAIService
{
    private readonly AzureOpenAIClient _client;
    private readonly OpenAIOptions _options;
    private readonly IMCPService _mcpService;
    private readonly ILogger<OpenAIService> _logger;

    public OpenAIService(
        IOptions<OpenAIOptions> options,
        IMCPService mcpService,
        ILogger<OpenAIService> logger)
    {
        _options = options.Value;
        _mcpService = mcpService;
        _logger = logger;

        // Initialize Azure OpenAI client
        _client = new AzureOpenAIClient(
            new Uri(_options.Endpoint),
            new AzureKeyCredential(_options.ApiKey));
    }

    /// <inheritdoc />
    public async Task<GenerateReportResponse> GenerateReportAsync(
        GenerateReportRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Generating report with prompt: {Prompt}", request.Prompt);

            // Get Azure DevOps context if requested
            AzureDevOpsContext? context = null;
            if (request.IncludeAzureDevOpsData && !string.IsNullOrEmpty(request.Version))
            {
                context = await _mcpService.GetReleaseContextAsync(request.Version, cancellationToken);
            }
            else if (request.IncludeAzureDevOpsData && !string.IsNullOrEmpty(request.Sprint))
            {
                context = await _mcpService.GetSprintContextAsync(request.Sprint, cancellationToken);
            }

            // Build system prompt
            var systemPrompt = BuildSystemPromptForReportGeneration(context);

            // Build user prompt
            var userPrompt = BuildUserPromptForReportGeneration(request, context);

            // Call OpenAI
            var chatClient = _client.GetChatClient(_options.DeploymentName);
            
            var messages = new List<OpenAIChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            var chatOptions = new ChatCompletionOptions
            {
                Temperature = (float)_options.Temperature,
                MaxOutputTokenCount = _options.MaxTokens,
                ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
            };

            var response = await chatClient.CompleteChatAsync(messages, chatOptions, cancellationToken);

            // Parse response
            var reportData = response.Value.Content[0].Text;
            
            _logger.LogInformation("Successfully generated report");

            return new GenerateReportResponse
            {
                ReportDataJson = reportData,
                SuggestedPackage = context?.Release?.Packages.FirstOrDefault(),
                SuggestedSprint = context?.Release?.Sprint,
                SuggestedDeploymentDate = context?.Deployment?.DeploymentDate,
                AzureDevOpsContext = context,
                Model = _options.DeploymentName,
                TokensUsed = response.Value.Usage.TotalTokenCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating report");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<CompleteSectionResponse> CompleteSectionAsync(
        CompleteSectionRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Completing section: {SectionName} for report: {ReportId}", 
                request.SectionName, request.ReportId);

            // Get Azure DevOps context if requested
            AzureDevOpsContext? context = null;
            if (request.IncludeAzureDevOpsContext)
            {
                // Try to extract version from report ID or use MCP to get context
                context = await _mcpService.GetReleaseContextAsync("latest", cancellationToken);
            }

            // Build prompts
            var systemPrompt = BuildSystemPromptForSectionCompletion();
            var userPrompt = BuildUserPromptForSectionCompletion(request, context);

            // Call OpenAI
            var chatClient = _client.GetChatClient(_options.DeploymentName);
            
            var messages = new List<OpenAIChatMessage>
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(userPrompt)
            };

            var chatOptions = new ChatCompletionOptions
            {
                Temperature = (float)_options.Temperature,
                MaxOutputTokenCount = _options.MaxTokens
            };

            var response = await chatClient.CompleteChatAsync(messages, chatOptions, cancellationToken);

            var content = response.Value.Content[0].Text;
            
            _logger.LogInformation("Successfully completed section: {SectionName}", request.SectionName);

            return new CompleteSectionResponse
            {
                Content = content,
                Model = _options.DeploymentName,
                TokensUsed = response.Value.Usage.TotalTokenCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error completing section");
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<ChatResponse> ChatAsync(
        ChatRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Processing chat message: {Message}", request.Message);

            // Build conversation history
            var messages = new List<OpenAIChatMessage>
            {
                new SystemChatMessage(BuildSystemPromptForChat())
            };

            // Add history
            if (request.History != null)
            {
                foreach (var msg in request.History)
                {
                    messages.Add(msg.Role.ToLower() == "user" 
                        ? new UserChatMessage(msg.Content)
                        : new AssistantChatMessage(msg.Content));
                }
            }

            // Add current message
            messages.Add(new UserChatMessage(request.Message));

            // Call OpenAI
            var chatClient = _client.GetChatClient(_options.DeploymentName);
            
            var chatOptions = new ChatCompletionOptions
            {
                Temperature = (float)_options.Temperature,
                MaxOutputTokenCount = _options.MaxTokens
            };

            var response = await chatClient.CompleteChatAsync(messages, chatOptions, cancellationToken);

            var content = response.Value.Content[0].Text;
            
            // Detect suggested actions
            var suggestedActions = DetectSuggestedActions(request.Message, content);

            _logger.LogInformation("Successfully processed chat message");

            return new ChatResponse
            {
                Message = content,
                SuggestedActions = suggestedActions,
                Model = _options.DeploymentName,
                TokensUsed = response.Value.Usage.TotalTokenCount
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat");
            throw;
        }
    }

    /// <inheritdoc />
    public async IAsyncEnumerable<string> StreamChatAsync(
        ChatRequest request,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Streaming chat message: {Message}", request.Message);

        // Build messages
        var messages = new List<OpenAIChatMessage>
        {
            new SystemChatMessage(BuildSystemPromptForChat())
        };

        if (request.History != null)
        {
            foreach (var msg in request.History)
            {
                messages.Add(msg.Role.ToLower() == "user" 
                    ? new UserChatMessage(msg.Content)
                    : new AssistantChatMessage(msg.Content));
            }
        }

        messages.Add(new UserChatMessage(request.Message));

        // Stream response
        var chatClient = _client.GetChatClient(_options.DeploymentName);
        
        var chatOptions = new ChatCompletionOptions
        {
            Temperature = (float)_options.Temperature,
            MaxOutputTokenCount = _options.MaxTokens
        };

        await foreach (var update in chatClient.CompleteChatStreamingAsync(messages, chatOptions, cancellationToken))
        {
            foreach (var contentPart in update.ContentUpdate)
            {
                yield return contentPart.Text;
            }
        }
    }

    #region Private Helper Methods

    private string BuildSystemPromptForReportGeneration(AzureDevOpsContext? context)
    {
        return @"Tu es un expert en rédaction de rapports de mise en production (CR MEP) pour des projets informatiques.

Ton rôle est de générer des rapports professionnels, détaillés et structurés en français.

Format de sortie : JSON structuré avec les champs suivants :
{
  ""titre"": ""Titre du rapport"",
  ""version"": ""Version de la release"",
  ""sprint"": ""Nom du sprint"",
  ""dateDeploiement"": ""Date de déploiement"",
  ""resumeExecutif"": ""Résumé exécutif"",
  ""objectifs"": ""Objectifs de la MEP"",
  ""perimetreFonctionnel"": ""Périmètre fonctionnel détaillé"",
  ""testsRealises"": ""Tests réalisés et résultats"",
  ""incidentsRencontres"": ""Incidents rencontrés et résolutions"",
  ""conclusion"": ""Conclusion et recommandations"",
  ""environnements"": [""DEV"", ""QA"", ""UAT"", ""PROD""],
  ""statut"": ""Succès/Échec""
}

Utilise les données Azure DevOps fournies pour enrichir le rapport avec des informations précises et factuelles.";
    }

    private string BuildUserPromptForReportGeneration(GenerateReportRequest request, AzureDevOpsContext? context)
    {
        var prompt = $"Demande de l'utilisateur : {request.Prompt}\n\n";

        if (context != null)
        {
            prompt += "Contexte Azure DevOps disponible :\n";
            prompt += JsonSerializer.Serialize(context, new JsonSerializerOptions { WriteIndented = true });
            prompt += "\n\n";
        }

        prompt += "Génère un rapport CR MEP complet et professionnel au format JSON spécifié.";

        return prompt;
    }

    private string BuildSystemPromptForSectionCompletion()
    {
        return @"Tu es un expert en rédaction de rapports de mise en production.

Ton rôle est de compléter ou améliorer une section spécifique d'un rapport CR MEP.

Fournis un contenu professionnel, détaillé et pertinent en français.
Le contenu doit être cohérent avec le reste du rapport et utiliser les données Azure DevOps si disponibles.";
    }

    private string BuildUserPromptForSectionCompletion(CompleteSectionRequest request, AzureDevOpsContext? context)
    {
        var prompt = $"Section à compléter : {request.SectionName}\n\n";

        if (!string.IsNullOrEmpty(request.CurrentContent))
        {
            prompt += $"Contenu actuel :\n{request.CurrentContent}\n\n";
        }

        if (!string.IsNullOrEmpty(request.Instruction))
        {
            prompt += $"Instruction : {request.Instruction}\n\n";
        }

        if (context != null)
        {
            prompt += "Contexte Azure DevOps :\n";
            prompt += JsonSerializer.Serialize(context, new JsonSerializerOptions { WriteIndented = true });
            prompt += "\n\n";
        }

        prompt += "Génère un contenu professionnel et détaillé pour cette section.";

        return prompt;
    }

    private string BuildSystemPromptForChat()
    {
        return @"Tu es un assistant IA spécialisé dans la gestion des rapports de mise en production (CR MEP).

Tu peux :
- Répondre aux questions sur les rapports
- Aider à générer ou compléter des rapports
- Fournir des informations sur Azure DevOps
- Suggérer des améliorations

Réponds de manière professionnelle, claire et concise en français.";
    }

    private List<SuggestedAction>? DetectSuggestedActions(string userMessage, string aiResponse)
    {
        var actions = new List<SuggestedAction>();

        // Detect if user wants to generate a report
        if (userMessage.Contains("génère", StringComparison.OrdinalIgnoreCase) ||
            userMessage.Contains("créer", StringComparison.OrdinalIgnoreCase))
        {
            actions.Add(new SuggestedAction
            {
                Type = "generate_report",
                Label = "Générer le rapport",
                Parameters = new Dictionary<string, string>()
            });
        }

        // Detect if user wants to complete a section
        if (userMessage.Contains("complète", StringComparison.OrdinalIgnoreCase) ||
            userMessage.Contains("rempli", StringComparison.OrdinalIgnoreCase))
        {
            actions.Add(new SuggestedAction
            {
                Type = "complete_section",
                Label = "Compléter la section",
                Parameters = new Dictionary<string, string>()
            });
        }

        return actions.Count > 0 ? actions : null;
    }

    #endregion
}

/// <summary>
/// OpenAI configuration options
/// </summary>
public class OpenAIOptions
{
    /// <summary>
    /// Azure OpenAI endpoint
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Azure OpenAI API key
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Deployment name (model)
    /// </summary>
    public string DeploymentName { get; set; } = "gpt-4";

    /// <summary>
    /// Maximum tokens for completion
    /// </summary>
    public int MaxTokens { get; set; } = 4000;

    /// <summary>
    /// Temperature for generation (0.0 - 2.0)
    /// </summary>
    public double Temperature { get; set; } = 0.7;
}
