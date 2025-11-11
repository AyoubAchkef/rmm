namespace CRMEPReport.API.Models;

public class ReportIndex
{
    public DateTime LastUpdated { get; set; }
    public List<ReportIndexEntry> Reports { get; set; } = new();
}

public class ReportIndexEntry
{
    public required string Id { get; set; }
    public required string Package { get; set; }
    public required string Sprint { get; set; }
    public required string Path { get; set; }
    public string Status { get; set; } = "draft";
    public DateTime CreatedAt { get; set; }
    public List<string> Tags { get; set; } = new();
}
