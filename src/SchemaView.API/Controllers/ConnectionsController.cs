using Microsoft.AspNetCore.Mvc;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;

namespace SchemaView.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConnectionsController(IConnectionService connectionService) : ApiControllerBase
    {
        [HttpPost("test")]
        public async Task<IActionResult> TestConnection([FromBody] TestConnectionRequestDto request)
        {
            var result = await connectionService.TestConnectionAsync(request);
            return HandleResult(result);
        }
    }
}
