using CRMEPReport.API.Data;
using CRMEPReport.API.Data.Entities;
using CRMEPReport.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CRMEPReport.API.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ReportService> _logger;

    public ReportService(AppDbContext context, ILogger<ReportService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ReportResponse> CreateReportAsync(CreateReportRequest request)
    {
        _logger.LogInformation("Creating new report");

        var report = new Report
        {
            DataJson = request.DataJson,
            Package = request.Package,
            Sprint = request.Sprint,
            DeploymentDate = request.DeploymentDate,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Report created with ID: {ReportId}", report.Id);

        return MapToResponse(report);
    }

    public async Task<IEnumerable<ReportResponse>> GetAllReportsAsync()
    {
        _logger.LogInformation("Retrieving all reports");

        var reports = await _context.Reports
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reports.Select(MapToResponse);
    }

    public async Task<ReportResponse?> GetReportByIdAsync(Guid id)
    {
        _logger.LogInformation("Retrieving report with ID: {ReportId}", id);

        var report = await _context.Reports.FindAsync(id);

        return report == null ? null : MapToResponse(report);
    }

    public async Task<ReportResponse?> UpdateReportAsync(Guid id, UpdateReportRequest request)
    {
        _logger.LogInformation("Updating report with ID: {ReportId}", id);

        var report = await _context.Reports.FindAsync(id);
        if (report == null)
        {
            _logger.LogWarning("Report not found: {ReportId}", id);
            return null;
        }

        report.DataJson = request.DataJson;
        report.Package = request.Package;
        report.Sprint = request.Sprint;
        report.DeploymentDate = request.DeploymentDate;
        report.Status = request.Status;
        report.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Report updated: {ReportId}", id);

        return MapToResponse(report);
    }

    public async Task<bool> DeleteReportAsync(Guid id)
    {
        _logger.LogInformation("Deleting report with ID: {ReportId}", id);

        var report = await _context.Reports.FindAsync(id);
        if (report == null)
        {
            _logger.LogWarning("Report not found: {ReportId}", id);
            return false;
        }

        _context.Reports.Remove(report);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Report deleted: {ReportId}", id);

        return true;
    }

    private static ReportResponse MapToResponse(Report report)
    {
        return new ReportResponse
        {
            Id = report.Id,
            CreatedAt = report.CreatedAt,
            UpdatedAt = report.UpdatedAt,
            DataJson = report.DataJson,
            Package = report.Package,
            Sprint = report.Sprint,
            DeploymentDate = report.DeploymentDate,
            Status = report.Status
        };
    }
}
