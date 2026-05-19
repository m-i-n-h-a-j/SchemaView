using SchemaView.Application.DTOs;
using SchemaView.Application.Enums;
using SchemaView.Application.Interfaces;
using SchemaView.Domain.Common;

namespace SchemaView.Infrastructure.Services
{
    public sealed class DatabaseProviderService(
        PostgreSqlProviderService postgreSqlProviderService,
        OracleProviderService oracleProviderService
    ) : IDatabaseProvider
    {
        public Task<Result<IReadOnlyCollection<SchemaDto>>> GetSchemasAsync(
            DatabaseConnectionDto connection,
            CancellationToken cancellationToken = default
        )
        {
            return connection.Provider switch
            {
                DatabaseProvider.PostgreSql => postgreSqlProviderService.GetSchemasAsync(
                    connection,
                    cancellationToken
                ),
                DatabaseProvider.Oracle => oracleProviderService.GetSchemasAsync(
                    connection,
                    cancellationToken
                ),
                _ => Task.FromResult(
                    Result<IReadOnlyCollection<SchemaDto>>.Fail(
                        new Error(
                            "Provider.Unsupported",
                            $"Database provider '{connection.Provider}' is not supported."
                        )
                    )
                ),
            };
        }

        public Task<Result<IReadOnlyCollection<TableDto>>> GetTablesAsync(
            DatabaseConnectionDto connection,
            string schema,
            CancellationToken cancellationToken = default
        )
        {
            return connection.Provider switch
            {
                DatabaseProvider.PostgreSql => postgreSqlProviderService.GetTablesAsync(
                    connection,
                    schema,
                    cancellationToken
                ),
                DatabaseProvider.Oracle => oracleProviderService.GetTablesAsync(
                    connection,
                    schema,
                    cancellationToken
                ),
                _ => Task.FromResult(
                    Result<IReadOnlyCollection<TableDto>>.Fail(
                        new Error(
                            "Provider.Unsupported",
                            $"Database provider '{connection.Provider}' is not supported."
                        )
                    )
                ),
            };
        }

        public Task<Result<TableDataDto>> GetTableDataAsync(
            DatabaseConnectionDto connection,
            string schema,
            string table,
            CancellationToken cancellationToken = default
        )
        {
            return connection.Provider switch
            {
                DatabaseProvider.PostgreSql => postgreSqlProviderService.GetTableDataAsync(
                    connection,
                    schema,
                    table,
                    cancellationToken
                ),

                DatabaseProvider.Oracle => oracleProviderService.GetTableDataAsync(
                    connection,
                    schema,
                    table,
                    cancellationToken
                ),

                _ => Task.FromResult(
                    Result<TableDataDto>.Fail(
                        new Error(
                            "Provider.Unsupported",
                            $"Database provider '{connection.Provider}' is not supported."
                        )
                    )
                ),
            };
        }
    }
}
