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

        public async Task<Result<TableDataDto>> GetTableDataAsync(
            DatabaseConnectionDto connection,
            string schema,
            string table,
            TableDataQueryDto query,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var connectionString = connectionService.BuildConnectionString(connection);

                await using var conn = new NpgsqlConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                // Get columns
                const string columnsSql = """
                    SELECT
                        column_name,
                        data_type,
                        is_nullable
                    FROM information_schema.columns
                    WHERE table_schema = @schema
                      AND table_name = @table
                    ORDER BY ordinal_position;
                    """;

                var columns = new List<ColumnDataDto>();

                await using (var columnsCommand = new NpgsqlCommand(columnsSql, conn))
                {
                    columnsCommand.Parameters.AddWithValue("schema", schema);
                    columnsCommand.Parameters.AddWithValue("table", table);

                    await using var reader = await columnsCommand.ExecuteReaderAsync(
                        cancellationToken
                    );

                    while (await reader.ReadAsync(cancellationToken))
                    {
                        columns.Add(
                            new ColumnDataDto
                            {
                                Name = reader.GetString(0),
                                DataType = reader.GetString(1),
                                IsNullable = reader.GetString(2) == "YES",
                            }
                        );
                    }
                }

                var offset = Math.Max(0, query.Offset);
                var limit = Math.Clamp(query.Limit, 1, 500);
                var sortColumn = ResolveSortColumn(columns, query.SortColumn);
                var sortDirection = ResolveSortDirection(query.SortDirection);
                var orderBySql = sortColumn is null
                    ? string.Empty
                    : $"ORDER BY \"{EscapeIdentifier(sortColumn)}\" {sortDirection}";

                // Get total rows
                var countSql = $"""
                    SELECT COUNT(*)
                    FROM "{EscapeIdentifier(schema)}"."{EscapeIdentifier(table)}";
                    """;

                int totalRows;

                await using (var countCommand = new NpgsqlCommand(countSql, conn))
                {
                    totalRows = Convert.ToInt32(
                        await countCommand.ExecuteScalarAsync(cancellationToken)
                    );
                }

                var dataSql = $"""
                    SELECT *
                    FROM "{EscapeIdentifier(schema)}"."{EscapeIdentifier(table)}"
                    {orderBySql}
                    LIMIT @limit OFFSET @offset;
                    """;

                var rows = new List<IReadOnlyDictionary<string, object?>>();

                await using (var dataCommand = new NpgsqlCommand(dataSql, conn))
                {
                    dataCommand.Parameters.AddWithValue("limit", limit);
                    dataCommand.Parameters.AddWithValue("offset", offset);

                    await using (
                        var reader = await dataCommand.ExecuteReaderAsync(cancellationToken)
                    )
                    {
                        while (await reader.ReadAsync(cancellationToken))
                        {
                            var row = new Dictionary<string, object?>();

                            for (var i = 0; i < reader.FieldCount; i++)
                            {
                                row[reader.GetName(i)] = await reader.IsDBNullAsync(
                                    i,
                                    cancellationToken
                                )
                                    ? null
                                    : reader.GetValue(i);
                            }

                            rows.Add(row);
                        }
                    }
                }

                return Result<TableDataDto>.Success(
                    new TableDataDto
                    {
                        Schema = schema,
                        Table = table,
                        Columns = columns,
                        Rows = rows,
                        TotalRows = totalRows,
                    }
                );
            }
            catch (Exception ex)
            {
                return Result<TableDataDto>.Fail(new Error("General.Validation", ex.Message));
            }
        }

        private static string? ResolveSortColumn(
            IReadOnlyCollection<ColumnDataDto> columns,
            string? sortColumn
        )
        {
            if (string.IsNullOrWhiteSpace(sortColumn))
            {
                return null;
            }

            return columns
                .FirstOrDefault(column =>
                    string.Equals(column.Name, sortColumn, StringComparison.OrdinalIgnoreCase)
                )
                ?.Name;
        }

        private static string ResolveSortDirection(string? sortDirection)
        {
            return string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase)
                ? "DESC"
                : "ASC";
        }

        private static string EscapeIdentifier(string identifier)
        {
            return identifier.Replace("\"", "\"\"");
        }
    }
}
