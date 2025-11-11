namespace CRMEPReport.API.Models;

public class ReportMetadata
{
    public required string Id { get; set; }
    public required string Package { get; set; }
    public required string Sprint { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; } = "System";
    public string Status { get; set; } = "draft"; // draft, final, archived
    public int Version { get; set; } = 1;
    public List<string> Tags { get; set; } = new();
    public DateTime? DeploymentDate { get; set; }
}
