using Npgsql;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;

namespace SchemaView.Infrastructure.Services
{
    public sealed class PostgreSqlProvider : IDatabaseProvider
    {
        public async Task<IReadOnlyCollection<SchemaDto>> GetSchemasAsync(
            string connectionString,
            CancellationToken cancellationToken = default
        )
        {
            var schemas = new List<SchemaDto>();

            await using var connection = new NpgsqlConnection(connectionString);

            await connection.OpenAsync(cancellationToken);

            const string sql = """
                SELECT schema_name
                FROM information_schema.schemata
                WHERE schema_name NOT IN
                ('pg_catalog', 'information_schema')
                ORDER BY schema_name;
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);

            while (await reader.ReadAsync(cancellationToken))
            {
                schemas.Add(new SchemaDto { Name = reader.GetString(0) });
            }

            return schemas;
        }

        public async Task<IReadOnlyCollection<TableDto>> GetTablesAsync(
            string connectionString,
            string schema,
            CancellationToken cancellationToken = default
        )
        {
            var tables = new List<TableDto>();

            await using var connection = new NpgsqlConnection(connectionString);

            await connection.OpenAsync(cancellationToken);

            const string sql = """
                SELECT table_schema, table_name
                FROM information_schema.tables
                WHERE table_schema = @schema
                AND table_type = 'BASE TABLE'
                ORDER BY table_name;
                """;

            await using var command = new NpgsqlCommand(sql, connection);

            command.Parameters.AddWithValue("schema", schema);

            await using var reader = await command.ExecuteReaderAsync(cancellationToken);

            while (await reader.ReadAsync(cancellationToken))
            {
                tables.Add(
                    new TableDto { Schema = reader.GetString(0), Name = reader.GetString(1) }
                );
            }

            return tables;
        }
    }
}
