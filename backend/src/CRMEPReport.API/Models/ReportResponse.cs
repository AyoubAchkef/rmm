namespace CRMEPReport.API.Models;

public class ReportResponse
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string DataJson { get; set; } = string.Empty;
    public string? Package { get; set; }
    public string? Sprint { get; set; }
    public DateTime? DeploymentDate { get; set; }
    public string? Status { get; set; }
}
