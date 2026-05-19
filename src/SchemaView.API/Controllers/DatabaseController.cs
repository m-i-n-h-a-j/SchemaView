using Microsoft.AspNetCore.Mvc;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;

namespace SchemaView.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DatabaseController(IDatabaseProvider databaseProvider) : ApiControllerBase
    {
        [HttpPost("schemas")]
        public async Task<IActionResult> GetSchemas(
            [FromBody] DatabaseConnectionDto connection,
            CancellationToken cancellationToken
        )
        {
            var result = await databaseProvider.GetSchemasAsync(connection, cancellationToken);

            return HandleResult(result);
        }

        [HttpPost("tables/{schema}")]
        public async Task<IActionResult> GetTables(
            [FromBody] DatabaseConnectionDto connection,
            [FromRoute] string schema,
            CancellationToken cancellationToken
        )
        {
            var result = await databaseProvider.GetTablesAsync(
                connection,
                schema,
                cancellationToken
            );

            return HandleResult(result);
        }

        [HttpPost("tables/{schema}/{table}")]
        public async Task<IActionResult> GetTableData(
            [FromBody] DatabaseConnectionDto connection,
            [FromRoute] string schema,
            [FromRoute] string table,
            [FromQuery] TableDataQueryDto query,
            CancellationToken cancellationToken
        )
        {
            var result = await databaseProvider.GetTableDataAsync(
                connection,
                schema,
                table,
                query,
                cancellationToken
            );

            return HandleResult(result);
        }
    }
}
