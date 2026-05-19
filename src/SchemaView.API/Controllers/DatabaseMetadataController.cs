using MediatR;
using Microsoft.AspNetCore.Mvc;
using SchemaView.Application.DatabaseMetadata.Queries;

namespace SchemaView.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class DatabaseMetadataController(ISender sender) : ControllerBase
{
    [HttpGet("{connectionId}/schemas")]
    public async Task<IActionResult> GetSchemas(
    string connectionId,
    CancellationToken cancellationToken)
    {
        var result = await sender.Send(
            new GetSchemasQuery(connectionId),
            cancellationToken);

        return Ok(result);
    }
}