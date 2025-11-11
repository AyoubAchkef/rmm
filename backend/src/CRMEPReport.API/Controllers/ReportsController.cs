using CRMEPReport.API.Models;
using CRMEPReport.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CRMEPReport.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    /// <summary>
    /// Get all reports
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ReportResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ReportResponse>>> GetAll()
    {
        var reports = await _reportService.GetAllReportsAsync();
        return Ok(reports);
    }

    /// <summary>
    /// Get a report by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportResponse>> GetById(Guid id)
    {
        var report = await _reportService.GetReportByIdAsync(id);
        if (report == null)
        {
            return NotFound(new { message = $"Report with ID {id} not found" });
        }

        return Ok(report);
    }

    /// <summary>
    /// Create a new report
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReportResponse>> Create([FromBody] CreateReportRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var report = await _reportService.CreateReportAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
    }

    /// <summary>
    /// Update an existing report
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ReportResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReportResponse>> Update(Guid id, [FromBody] UpdateReportRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var report = await _reportService.UpdateReportAsync(id, request);
        if (report == null)
        {
            return NotFound(new { message = $"Report with ID {id} not found" });
        }

        return Ok(report);
    }

    /// <summary>
    /// Delete a report
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _reportService.DeleteReportAsync(id);
        if (!result)
        {
            return NotFound(new { message = $"Report with ID {id} not found" });
        }

        return NoContent();
    }
}
