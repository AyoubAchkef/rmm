using System.Text;
using System.Text.Json;
using CRMEPReport.API.Models;

namespace CRMEPReport.API.Services;

public interface IFileSystemReportService
{
    Task<ReportMetadata> CreateReportAsync(ReportCreateRequest request);
    Task<ReportMetadata> UpdateReportAsync(string id, ReportUpdateRequest request);
    Task<ReportDetails?> GetReportAsync(string id);
    Task<List<ReportMetadata>> ListReportsAsync();
    Task DeleteReportAsync(string id);
}

public class FileSystemReportService : IFileSystemReportService
{
    private readonly string _reportsBasePath;
    private readonly string _indexFilePath;
    private readonly ILogger<FileSystemReportService> _logger;
    private readonly JsonSerializerOptions _jsonOptions;

    public FileSystemReportService(IConfiguration configuration, ILogger<FileSystemReportService> logger)
    {
        _logger = logger;

        // Base path pour les rapports
        var basePath = configuration["ReportsPath"] ??
            Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "Rapports");

        _reportsBasePath = Path.GetFullPath(basePath);
        _indexFilePath = Path.Combine(_reportsBasePath, "index.json");

        // Options JSON pour formattage lisible
        _jsonOptions = new JsonSerializerOptions
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        // Créer le dossier racine si nécessaire
        if (!Directory.Exists(_reportsBasePath))
        {
            Directory.CreateDirectory(_reportsBasePath);
            _logger.LogInformation("Created reports base directory: {Path}", _reportsBasePath);
        }
    }

    public async Task<ReportMetadata> CreateReportAsync(ReportCreateRequest request)
    {
        _logger.LogInformation("Creating new report for package {Package}", request.Package);

        var reportId = Guid.NewGuid().ToString();
        var now = DateTime.UtcNow;

        // Créer les métadonnées
        var metadata = new ReportMetadata
        {
            Id = reportId,
            Package = request.Package ?? "Unknown",
            Sprint = request.Sprint ?? "Unknown",
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = request.CreatedBy ?? "System",
            Status = "draft",
            Version = 1,
            Tags = request.Tags ?? new List<string>(),
            DeploymentDate = request.DeploymentDate
        };

        // Créer l'arborescence: Rapports/{année}/Sprint_{sprint}/Rapport_MEP_{package}
        var year = now.Year.ToString();
        var sanitizedSprint = SanitizeFileName(request.Sprint ?? "Unknown");
        var sanitizedPackage = SanitizeFileName(request.Package ?? "Unknown");

        var reportFolderPath = Path.Combine(
            _reportsBasePath,
            year,
            $"Sprint_{sanitizedSprint}",
            $"Rapport_MEP_{sanitizedPackage}"
        );

        Directory.CreateDirectory(reportFolderPath);

        // Sauvegarder metadata.json
        var metadataPath = Path.Combine(reportFolderPath, "metadata.json");
        await File.WriteAllTextAsync(metadataPath,
            JsonSerializer.Serialize(metadata, _jsonOptions));

        // Sauvegarder data.json
        var dataPath = Path.Combine(reportFolderPath, "data.json");
        await File.WriteAllTextAsync(dataPath,
            JsonSerializer.Serialize(request.Data, _jsonOptions));

        // Générer et sauvegarder le HTML
        var htmlPath = Path.Combine(reportFolderPath, $"rapport_mep_{sanitizedPackage}.html");
        var htmlContent = GenerateHtmlReport(request.Data, request.TemplateHtml);
        await File.WriteAllTextAsync(htmlPath, htmlContent);

        // Créer le changelog initial
        var changelogPath = Path.Combine(reportFolderPath, "changelog.jsonl");
        var changelogEntry = new ChangelogEntry
        {
            Timestamp = now,
            Action = "created",
            User = request.CreatedBy ?? "System",
            Version = 1
        };
        await AppendChangelogEntryAsync(changelogPath, changelogEntry);

        // Mettre à jour l'index global
        await UpdateGlobalIndexAsync(metadata, reportFolderPath);

        _logger.LogInformation("Report created successfully with ID: {Id} at {Path}",
            reportId, reportFolderPath);

        return metadata;
    }

    public async Task<ReportMetadata> UpdateReportAsync(string id, ReportUpdateRequest request)
    {
        _logger.LogInformation("Updating report {Id}", id);

        var reportPath = await FindReportPathAsync(id);
        if (reportPath == null)
        {
            throw new FileNotFoundException($"Report with ID {id} not found");
        }

        // Charger les métadonnées existantes
        var metadataPath = Path.Combine(reportPath, "metadata.json");
        var metadataJson = await File.ReadAllTextAsync(metadataPath);
        var metadata = JsonSerializer.Deserialize<ReportMetadata>(metadataJson, _jsonOptions)
            ?? throw new InvalidOperationException("Failed to deserialize metadata");

        // Charger les anciennes données pour comparaison
        var dataPath = Path.Combine(reportPath, "data.json");
        var oldDataJson = await File.ReadAllTextAsync(dataPath);
        var oldData = JsonSerializer.Deserialize<Dictionary<string, object>>(oldDataJson, _jsonOptions);

        // Créer une sauvegarde de version
        var now = DateTime.UtcNow;
        var versionsFolder = Path.Combine(reportPath, "versions");
        Directory.CreateDirectory(versionsFolder);

        var versionBackupPath = Path.Combine(versionsFolder,
            $"data_v{metadata.Version}_{now:yyyyMMdd_HHmmss}.json");
        await File.WriteAllTextAsync(versionBackupPath, oldDataJson);

        // Mettre à jour la version et les métadonnées
        metadata.Version++;
        metadata.UpdatedAt = now;
        metadata.Status = request.Status ?? metadata.Status;

        if (request.Tags != null)
        {
            metadata.Tags = request.Tags;
        }

        // Sauvegarder les nouvelles métadonnées
        await File.WriteAllTextAsync(metadataPath,
            JsonSerializer.Serialize(metadata, _jsonOptions));

        // Sauvegarder les nouvelles données
        await File.WriteAllTextAsync(dataPath,
            JsonSerializer.Serialize(request.Data, _jsonOptions));

        // Régénérer le HTML
        var sanitizedPackage = SanitizeFileName(metadata.Package);
        var htmlPath = Path.Combine(reportPath, $"rapport_mep_{sanitizedPackage}.html");
        var htmlContent = GenerateHtmlReport(request.Data, request.TemplateHtml);
        await File.WriteAllTextAsync(htmlPath, htmlContent);

        // Ajouter l'entrée au changelog avec les changements
        var changelogPath = Path.Combine(reportPath, "changelog.jsonl");
        var changes = DetectChanges(oldData, request.Data);
        var changelogEntry = new ChangelogEntry
        {
            Timestamp = now,
            Action = request.Action ?? "updated",
            User = request.UpdatedBy ?? "System",
            Version = metadata.Version,
            Changes = changes.Count > 0 ? changes : null
        };
        await AppendChangelogEntryAsync(changelogPath, changelogEntry);

        // Mettre à jour l'index global
        await UpdateGlobalIndexAsync(metadata, reportPath);

        _logger.LogInformation("Report {Id} updated to version {Version}", id, metadata.Version);

        return metadata;
    }

    public async Task<ReportDetails?> GetReportAsync(string id)
    {
        _logger.LogInformation("Retrieving report {Id}", id);

        var reportPath = await FindReportPathAsync(id);
        if (reportPath == null)
        {
            return null;
        }

        var metadataPath = Path.Combine(reportPath, "metadata.json");
        var dataPath = Path.Combine(reportPath, "data.json");
        var changelogPath = Path.Combine(reportPath, "changelog.jsonl");

        var metadataJson = await File.ReadAllTextAsync(metadataPath);
        var metadata = JsonSerializer.Deserialize<ReportMetadata>(metadataJson, _jsonOptions);

        var dataJson = await File.ReadAllTextAsync(dataPath);
        var data = JsonSerializer.Deserialize<Dictionary<string, object>>(dataJson, _jsonOptions);

        var changelog = new List<ChangelogEntry>();
        if (File.Exists(changelogPath))
        {
            var lines = await File.ReadAllLinesAsync(changelogPath);
            foreach (var line in lines)
            {
                if (!string.IsNullOrWhiteSpace(line))
                {
                    var entry = JsonSerializer.Deserialize<ChangelogEntry>(line, _jsonOptions);
                    if (entry != null)
                    {
                        changelog.Add(entry);
                    }
                }
            }
        }

        return new ReportDetails
        {
            Metadata = metadata!,
            Data = data!,
            Changelog = changelog,
            ReportPath = reportPath
        };
    }

    public async Task<List<ReportMetadata>> ListReportsAsync()
    {
        _logger.LogInformation("Listing all reports");

        var index = await LoadGlobalIndexAsync();

        var reports = new List<ReportMetadata>();
        foreach (var entry in index.Reports)
        {
            var metadataPath = Path.Combine(_reportsBasePath, entry.Path, "metadata.json");
            if (File.Exists(metadataPath))
            {
                var metadataJson = await File.ReadAllTextAsync(metadataPath);
                var metadata = JsonSerializer.Deserialize<ReportMetadata>(metadataJson, _jsonOptions);
                if (metadata != null)
                {
                    reports.Add(metadata);
                }
            }
        }

        // Deduplicate by ID (keep the most recent entry for each ID)
        return reports
            .GroupBy(r => r.Id)
            .Select(g => g.OrderByDescending(r => r.UpdatedAt).First())
            .OrderByDescending(r => r.CreatedAt)
            .ToList();
    }

    public async Task DeleteReportAsync(string id)
    {
        _logger.LogInformation("Deleting report {Id}", id);

        var reportPath = await FindReportPathAsync(id);
        if (reportPath == null)
        {
            throw new FileNotFoundException($"Report with ID {id} not found");
        }

        // Déplacer vers .archive au lieu de supprimer
        var archivePath = Path.Combine(_reportsBasePath, ".archive");
        Directory.CreateDirectory(archivePath);

        var reportFolderName = Path.GetFileName(reportPath);
        var archiveDestination = Path.Combine(archivePath,
            $"{reportFolderName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}");

        Directory.Move(reportPath, archiveDestination);

        // Retirer de l'index
        var index = await LoadGlobalIndexAsync();
        index.Reports.RemoveAll(r => r.Id == id);
        index.LastUpdated = DateTime.UtcNow;
        await SaveGlobalIndexAsync(index);

        _logger.LogInformation("Report {Id} archived to {Path}", id, archiveDestination);
    }

    // Méthodes privées utilitaires

    private async Task<string?> FindReportPathAsync(string id)
    {
        var index = await LoadGlobalIndexAsync();
        var entry = index.Reports.FirstOrDefault(r => r.Id == id);

        if (entry == null)
        {
            return null;
        }

        var fullPath = Path.Combine(_reportsBasePath, entry.Path);
        return Directory.Exists(fullPath) ? fullPath : null;
    }

    private async Task<ReportIndex> LoadGlobalIndexAsync()
    {
        if (!File.Exists(_indexFilePath))
        {
            return new ReportIndex
            {
                LastUpdated = DateTime.UtcNow,
                Reports = new List<ReportIndexEntry>()
            };
        }

        var json = await File.ReadAllTextAsync(_indexFilePath);
        var index = JsonSerializer.Deserialize<ReportIndex>(json, _jsonOptions)
            ?? new ReportIndex { LastUpdated = DateTime.UtcNow, Reports = new() };

        // Deduplicate index entries (keep only the most recent entry for each ID)
        index.Reports = index.Reports
            .GroupBy(r => r.Id)
            .Select(g => g.First())
            .ToList();

        return index;
    }

    private async Task SaveGlobalIndexAsync(ReportIndex index)
    {
        var json = JsonSerializer.Serialize(index, _jsonOptions);
        await File.WriteAllTextAsync(_indexFilePath, json);
    }

    private async Task UpdateGlobalIndexAsync(ReportMetadata metadata, string reportPath)
    {
        var index = await LoadGlobalIndexAsync();

        // Retirer l'ancienne entrée si elle existe
        index.Reports.RemoveAll(r => r.Id == metadata.Id);

        // Ajouter la nouvelle entrée
        var relativePath = Path.GetRelativePath(_reportsBasePath, reportPath);
        index.Reports.Add(new ReportIndexEntry
        {
            Id = metadata.Id,
            Package = metadata.Package,
            Sprint = metadata.Sprint,
            Path = relativePath,
            Status = metadata.Status,
            CreatedAt = metadata.CreatedAt,
            Tags = metadata.Tags
        });

        index.LastUpdated = DateTime.UtcNow;
        await SaveGlobalIndexAsync(index);
    }

    private async Task AppendChangelogEntryAsync(string changelogPath, ChangelogEntry entry)
    {
        var json = JsonSerializer.Serialize(entry, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await File.AppendAllTextAsync(changelogPath, json + Environment.NewLine);
    }

    private Dictionary<string, ChangeDetail> DetectChanges(
        Dictionary<string, object>? oldData,
        Dictionary<string, object>? newData)
    {
        var changes = new Dictionary<string, ChangeDetail>();

        if (oldData == null || newData == null)
        {
            return changes;
        }

        foreach (var key in newData.Keys)
        {
            if (!oldData.ContainsKey(key))
            {
                changes[key] = new ChangeDetail { Old = null, New = newData[key] };
            }
            else if (!AreValuesEqual(oldData[key], newData[key]))
            {
                changes[key] = new ChangeDetail { Old = oldData[key], New = newData[key] };
            }
        }

        return changes;
    }

    private bool AreValuesEqual(object? val1, object? val2)
    {
        if (val1 == null && val2 == null) return true;
        if (val1 == null || val2 == null) return false;

        var json1 = JsonSerializer.Serialize(val1);
        var json2 = JsonSerializer.Serialize(val2);

        return json1 == json2;
    }

    private string GenerateHtmlReport(Dictionary<string, object>? data, string? templateHtml)
    {
        // Si un template HTML est fourni, l'utiliser
        if (!string.IsNullOrEmpty(templateHtml))
        {
            return templateHtml;
        }

        // Sinon, générer un HTML basique
        var sb = new StringBuilder();
        sb.AppendLine("<!DOCTYPE html>");
        sb.AppendLine("<html>");
        sb.AppendLine("<head>");
        sb.AppendLine("    <meta charset=\"UTF-8\">");
        sb.AppendLine("    <title>Rapport CR MEP</title>");
        sb.AppendLine("</head>");
        sb.AppendLine("<body>");
        sb.AppendLine("    <h1>Rapport de Compte Rendu MEP</h1>");

        if (data != null)
        {
            foreach (var kvp in data)
            {
                sb.AppendLine($"    <p><strong>{kvp.Key}:</strong> {kvp.Value}</p>");
            }
        }

        sb.AppendLine("</body>");
        sb.AppendLine("</html>");

        return sb.ToString();
    }

    private string SanitizeFileName(string fileName)
    {
        var invalids = Path.GetInvalidFileNameChars();
        var sanitized = string.Join("_", fileName.Split(invalids, StringSplitOptions.RemoveEmptyEntries));
        return sanitized.Replace(" ", "_");
    }
}

// DTOs pour les requêtes

public class ReportCreateRequest
{
    public string? Package { get; set; }
    public string? Sprint { get; set; }
    public DateTime? DeploymentDate { get; set; }
    public string? CreatedBy { get; set; }
    public List<string>? Tags { get; set; }
    public Dictionary<string, object>? Data { get; set; }
    public string? TemplateHtml { get; set; }
}

public class ReportUpdateRequest
{
    public Dictionary<string, object>? Data { get; set; }
    public string? TemplateHtml { get; set; }
    public string? Status { get; set; }
    public List<string>? Tags { get; set; }
    public string? UpdatedBy { get; set; }
    public string? Action { get; set; }
}

public class ReportDetails
{
    public required ReportMetadata Metadata { get; set; }
    public required Dictionary<string, object> Data { get; set; }
    public List<ChangelogEntry> Changelog { get; set; } = new();
    public string? ReportPath { get; set; }
}
