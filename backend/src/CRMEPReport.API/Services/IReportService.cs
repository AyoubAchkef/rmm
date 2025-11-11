using CRMEPReport.API.Models;

namespace CRMEPReport.API.Services;

public interface IReportService
{
    Task<ReportResponse> CreateReportAsync(CreateReportRequest request);
    Task<IEnumerable<ReportResponse>> GetAllReportsAsync();
    Task<ReportResponse?> GetReportByIdAsync(Guid id);
    Task<ReportResponse?> UpdateReportAsync(Guid id, UpdateReportRequest request);
    Task<bool> DeleteReportAsync(Guid id);
}
