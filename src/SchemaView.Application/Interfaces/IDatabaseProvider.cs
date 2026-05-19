using SchemaView.Application.DTOs;

namespace SchemaView.Application.Interfaces
{
    public interface IDatabaseProvider
    {
        Task<IReadOnlyCollection<SchemaDto>> GetSchemasAsync(
            string connectionString,
            CancellationToken cancellationToken = default);

        Task<IReadOnlyCollection<TableDto>> GetTablesAsync(
            string connectionString,
            string schema,
            CancellationToken cancellationToken = default);
    }
}
