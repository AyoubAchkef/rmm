using Microsoft.AspNetCore.Mvc;

namespace CRMEPReport.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "CRMEPReport.API"
        });
    }
}
