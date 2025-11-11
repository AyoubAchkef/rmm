using Microsoft.AspNetCore.Mvc;
using CRMEPReport.API.Services;

namespace CRMEPReport.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FileReportsController : ControllerBase
{
    private readonly IFileSystemReportService _reportService;
    private readonly ILogger<FileReportsController> _logger;

    public FileReportsController(
        IFileSystemReportService reportService,
        ILogger<FileReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Créer un nouveau rapport
    /// POST /api/filereports
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateReport([FromBody] ReportCreateRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new report for package {Package}", request.Package);

            var metadata = await _reportService.CreateReportAsync(request);

            return Ok(new
            {
                success = true,
                message = "Rapport créé avec succès",
                data = metadata
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating report");
            return StatusCode(500, new
            {
                success = false,
                message = "Erreur lors de la création du rapport",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Mettre à jour un rapport existant
    /// PUT /api/filereports/{id}
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateReport(string id, [FromBody] ReportUpdateRequest request)
    {
        try
        {
            _logger.LogInformation("Updating report {Id}", id);

            var metadata = await _reportService.UpdateReportAsync(id, request);

            return Ok(new
            {
                success = true,
                message = "Rapport mis à jour avec succès",
                data = metadata
            });
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogWarning("Report not found: {Id}", id);
            return NotFound(new
            {
                success = false,
                message = "Rapport introuvable",
                error = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating report {Id}", id);
            return StatusCode(500, new
            {
                success = false,
                message = "Erreur lors de la mise à jour du rapport",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Récupérer un rapport par ID
    /// GET /api/filereports/{id}
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetReport(string id)
    {
        try
        {
            _logger.LogInformation("Retrieving report {Id}", id);

            var report = await _reportService.GetReportAsync(id);

            if (report == null)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Rapport introuvable"
                });
            }

            return Ok(new
            {
                success = true,
                data = report
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving report {Id}", id);
            return StatusCode(500, new
            {
                success = false,
                message = "Erreur lors de la récupération du rapport",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Lister tous les rapports
    /// GET /api/filereports
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> ListReports()
    {
        try
        {
            _logger.LogInformation("Listing all reports");

            var reports = await _reportService.ListReportsAsync();

            return Ok(new
            {
                success = true,
                data = reports,
                count = reports.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing reports");
            return StatusCode(500, new
            {
                success = false,
                message = "Erreur lors de la récupération des rapports",
                error = ex.Message
            });
        }
    }

    /// <summary>
    /// Supprimer (archiver) un rapport
    /// DELETE /api/filereports/{id}
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReport(string id)
    {
        try
        {
            _logger.LogInformation("Deleting report {Id}", id);

            await _reportService.DeleteReportAsync(id);

            return Ok(new
            {
                success = true,
                message = "Rapport archivé avec succès"
            });
        }
        catch (FileNotFoundException ex)
        {
            _logger.LogWarning("Report not found: {Id}", id);
            return NotFound(new
            {
                success = false,
                message = "Rapport introuvable",
                error = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting report {Id}", id);
            return StatusCode(500, new
            {
                success = false,
                message = "Erreur lors de la suppression du rapport",
                error = ex.Message
            });
        }
    }
}
