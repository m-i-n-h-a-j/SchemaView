

using SchemaView.Domain.DatabaseMetadata.Models;

namespace SchemaView.Domain.DatabaseMetadata.Services
{
    public interface IDatabaseMetadataService
    {
        Task<IReadOnlyCollection<DatabaseSchema>> GetSchemasAsync(
            string connectionId,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyCollection<DatabaseTable>> GetTablesAsync(
            string connectionId,
            string schema,
            CancellationToken cancellationToken = default);
    }
}
