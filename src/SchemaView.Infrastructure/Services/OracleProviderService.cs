using Oracle.ManagedDataAccess.Client;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;
using SchemaView.Domain.Common;

namespace SchemaView.Infrastructure.Services
{
    public sealed class OracleProviderService(IConnectionService connectionService)
        : IDatabaseProvider
    {
        public async Task<Result<IReadOnlyCollection<SchemaDto>>> GetSchemasAsync(
            DatabaseConnectionDto connection,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var schemas = new List<SchemaDto>();

                var connectionString = connectionService.BuildConnectionString(connection);

                await using var conn = new OracleConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                const string sql = """
                    SELECT username
                    FROM all_users
                    ORDER BY username
                    """;

                await using var command = new OracleCommand(sql, conn);

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);

                while (await reader.ReadAsync(cancellationToken))
                {
                    schemas.Add(new SchemaDto { Name = reader.GetString(0) });
                }

                return Result<IReadOnlyCollection<SchemaDto>>.Success(schemas);
            }
            catch (Exception ex)
            {
                return Result<IReadOnlyCollection<SchemaDto>>.Fail(
                    new Error("General.Validation", ex.Message)
                );
            }
        }

        public async Task<Result<IReadOnlyCollection<TableDto>>> GetTablesAsync(
            DatabaseConnectionDto connection,
            string schema,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var tables = new List<TableDto>();

                var connectionString = connectionService.BuildConnectionString(connection);

                await using var conn = new OracleConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                const string sql = """
                    SELECT owner, table_name
                    FROM all_tables
                    WHERE owner = :schema
                    ORDER BY table_name
                    """;

                await using var command = new OracleCommand(sql, conn);

                command.Parameters.Add(new OracleParameter("schema", schema.ToUpper()));

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);

                while (await reader.ReadAsync(cancellationToken))
                {
                    tables.Add(
                        new TableDto { Schema = reader.GetString(0), Name = reader.GetString(1) }
                    );
                }

                return Result<IReadOnlyCollection<TableDto>>.Success(tables);
            }
            catch (Exception ex)
            {
                return Result<IReadOnlyCollection<TableDto>>.Fail(
                    new Error("General.Validation", ex.Message)
                );
            }
        }
    }
}
