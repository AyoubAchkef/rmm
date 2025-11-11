using System.ComponentModel.DataAnnotations;

namespace CRMEPReport.API.Data.Entities;

public class Report
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Store all report data as JSON for flexibility
    [Required]
    public string DataJson { get; set; } = string.Empty;

    // Metadata for search and filtering
    [MaxLength(100)]
    public string? Package { get; set; }

    [MaxLength(100)]
    public string? Sprint { get; set; }

    public DateTime? DeploymentDate { get; set; }

    [MaxLength(50)]
    public string? Status { get; set; }
}
