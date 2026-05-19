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
                    WHERE owner = :schema
                      AND table_name = :table
                    ORDER BY column_id
                    """;

                var columns = new List<ColumnDataDto>();

                await using (var columnsCommand = new OracleCommand(columnsSql, conn))
                {
                    columnsCommand.Parameters.Add(new OracleParameter("schema", schema.ToUpper()));

                    columnsCommand.Parameters.Add(new OracleParameter("table", table.ToUpper()));

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

                // Get total rows
                var countSql = $"""
                    SELECT COUNT(*)
                    FROM "{schema}"."{table}"
                    """;

                int totalRows;

                await using (var countCommand = new OracleCommand(countSql, conn))
                {
                    totalRows = Convert.ToInt32(
                        await countCommand.ExecuteScalarAsync(cancellationToken)
                    );
                }

                // Get table data
                var dataSql = $"""
                    SELECT *
                    FROM "{schema}"."{table}"
                    """;

                var rows = new List<IReadOnlyDictionary<string, object?>>();

                await using (var dataCommand = new OracleCommand(dataSql, conn))
                await using (var reader = await dataCommand.ExecuteReaderAsync(cancellationToken))
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
    }
}
