using Npgsql;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;
using SchemaView.Domain.Common;

namespace SchemaView.Infrastructure.Services
{
    public sealed class PostgreSqlProviderService(IConnectionService connectionService)
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

                await using var conn = new NpgsqlConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                const string sql = """
                    SELECT schema_name
                    FROM information_schema.schemata
                    WHERE schema_name NOT IN
                    ('pg_catalog', 'information_schema')
                    ORDER BY schema_name;
                    """;

                await using var command = new NpgsqlCommand(sql, conn);

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

                await using var conn = new NpgsqlConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                const string sql = """
                    SELECT table_schema, table_name
                    FROM information_schema.tables
                    WHERE table_schema = @schema
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name;
                    """;

                await using var command = new NpgsqlCommand(sql, conn);

                command.Parameters.AddWithValue("schema", schema);

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
