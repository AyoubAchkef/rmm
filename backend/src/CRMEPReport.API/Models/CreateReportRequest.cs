using System.ComponentModel.DataAnnotations;

namespace CRMEPReport.API.Models;

public class CreateReportRequest
{
    [Required(ErrorMessage = "Report data is required")]
    public string DataJson { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Package { get; set; }

    [MaxLength(100)]
    public string? Sprint { get; set; }

    public DateTime? DeploymentDate { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }
}
