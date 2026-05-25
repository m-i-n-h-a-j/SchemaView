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

                await using var conn = new OracleConnection(connectionString);

                await conn.OpenAsync(cancellationToken);

                // Get columns
                const string columnsSql = """
                    SELECT
                        column_name,
                        data_type,
                        nullable
                    FROM all_tab_columns
                    WHERE owner = :schema_name
                      AND table_name = :table_name
                    ORDER BY column_id
                    """;

                var columns = new List<ColumnDataDto>();

                await using (var columnsCommand = new OracleCommand(columnsSql, conn))
                {
                    columnsCommand.BindByName = true;

                    columnsCommand.Parameters.Add(
                        new OracleParameter("schema_name", schema.ToUpperInvariant())
                    );

                    columnsCommand.Parameters.Add(
                        new OracleParameter("table_name", table.ToUpperInvariant())
                    );

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
                                IsNullable = reader.GetString(2) == "Y",
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
                var selectColumnsSql = string.Join(
                    ", ",
                    columns.Select(column => $"\"{EscapeIdentifier(column.Name)}\"")
                );
                var rowNumberColumn = ResolveRowNumberColumn(columns);

                // Get total rows
                var countSql = $"""
                    SELECT COUNT(*)
                    FROM "{EscapeIdentifier(schema)}"."{EscapeIdentifier(table)}"
                    """;

                int totalRows;

                await using (var countCommand = new OracleCommand(countSql, conn))
                {
                    totalRows = Convert.ToInt32(
                        await countCommand.ExecuteScalarAsync(cancellationToken)
                    );
                }

                // Get table data. Oracle 11g does not support OFFSET/FETCH, so use ROWNUM paging.
                var sourceSql = $"""
                    SELECT {selectColumnsSql}
                    FROM "{EscapeIdentifier(schema)}"."{EscapeIdentifier(table)}"
                    {orderBySql}
                    """;

                var dataSql = $"""
                    SELECT {selectColumnsSql}
                    FROM (
                        SELECT page_query.*, ROWNUM {rowNumberColumn}
                        FROM (
                            {sourceSql}
                        ) page_query
                        WHERE ROWNUM <= :max_rows
                    )
                    WHERE {rowNumberColumn} > :offset_rows
                    """;

                var rows = new List<IReadOnlyDictionary<string, object?>>();

                await using (var dataCommand = new OracleCommand(dataSql, conn))
                {
                    dataCommand.BindByName = true;
                    dataCommand.Parameters.Add(new OracleParameter("max_rows", offset + limit));
                    dataCommand.Parameters.Add(new OracleParameter("offset_rows", offset));

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

        private static string ResolveRowNumberColumn(IReadOnlyCollection<ColumnDataDto> columns)
        {
            const string baseName = "schema_view_row_num";
            var name = baseName;
            var suffix = 1;

            while (
                columns.Any(column =>
                    string.Equals(column.Name, name, StringComparison.OrdinalIgnoreCase)
                )
            )
            {
                name = $"{baseName}_{suffix}";
                suffix++;
            }

            return name;
        }

        private static string EscapeIdentifier(string identifier)
        {
            return identifier.Replace("\"", "\"\"");
        }
    }
}
