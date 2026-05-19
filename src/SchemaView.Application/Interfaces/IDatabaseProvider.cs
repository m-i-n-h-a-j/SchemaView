using SchemaView.Application.DTOs;
using SchemaView.Domain.Common;

namespace SchemaView.Application.Interfaces
{
    public interface IDatabaseProvider
    {
        Task<Result<IReadOnlyCollection<SchemaDto>>> GetSchemasAsync(
            DatabaseConnectionDto connection,
            CancellationToken cancellationToken = default
        );

        Task<Result<IReadOnlyCollection<TableDto>>> GetTablesAsync(
            DatabaseConnectionDto connection,
            string schema,
            CancellationToken cancellationToken = default
        );
    }
}
