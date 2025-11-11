namespace CRMEPReport.API.Models;

public class ChangelogEntry
{
    public DateTime Timestamp { get; set; }
    public required string Action { get; set; } // created, updated, finalized, archived
    public string User { get; set; } = "System";
    public int Version { get; set; }
    public Dictionary<string, ChangeDetail>? Changes { get; set; }
}

public class ChangeDetail
{
    public object? Old { get; set; }
    public object? New { get; set; }
}
