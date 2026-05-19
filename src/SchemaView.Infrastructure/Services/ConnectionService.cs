using Npgsql;
using Oracle.ManagedDataAccess.Client;
using SchemaView.Application.DTOs;
using SchemaView.Application.Enums;
using SchemaView.Application.Interfaces;
using SchemaView.Domain.Common;

namespace SchemaView.Infrastructure.Services
{
    public class ConnectionService : IConnectionService
    {
        public async Task<Result> TestConnectionAsync(DatabaseConnectionDto request)
        {
            try
            {
                var connectionString = BuildConnectionString(request);

                return request.Provider switch
                {
                    DatabaseProvider.PostgreSql => await TestPostgreSqlConnectionAsync(
                        connectionString
                    ),
                    DatabaseProvider.Oracle => (Result)
                        await TestOracleConnectionAsync(connectionString),
                    _ => Result.Failure(
                        new Error(
                            "General.Validation",
                            $"Provider '{request.Provider}' is not supported."
                        )
                    ),
                };
            }
            catch (Exception ex)
            {
                return Result.Failure(new Error("General.Validation", ex.Message));
            }
        }

        private static async Task<Result> TestPostgreSqlConnectionAsync(string connectionString)
        {
            try
            {
                await using var conn = new NpgsqlConnection(connectionString);
                await conn.OpenAsync();
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure(new Error("General.Validation", ex.Message));
            }
        }

        public static async Task<Result> TestOracleConnectionAsync(string connectionString)
        {
            try
            {
                await using var conn = new OracleConnection(connectionString);

                await conn.OpenAsync();

                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure(new Error("General.Validation", ex.Message));
            }
        }

        public string BuildConnectionString(DatabaseConnectionDto request)
        {
            return request.Provider switch
            {
                DatabaseProvider.PostgreSql => BuildPostgreSqlConnectionString(request),

                DatabaseProvider.SqlServer => string.Empty,

                DatabaseProvider.MySql => string.Empty,

                DatabaseProvider.Oracle => BuildOracleConnectionString(request),

                _ => throw new NotSupportedException(
                    $"Provider '{request.Provider}' is not supported."
                ),
            };
        }

        private static string BuildPostgreSqlConnectionString(DatabaseConnectionDto request)
        {
            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = request.Host,
                Port = request.Port,
                Database = request.Database,
                Username = request.Username,
                Password = request.Password,
                SslMode = request.Ssl ? SslMode.Require : SslMode.Disable,
            };

            return builder.ConnectionString;
        }

        private static string BuildOracleConnectionString(DatabaseConnectionDto request)
        {
            var builder = new OracleConnectionStringBuilder
            {
                UserID = request.Username,
                Password = request.Password,
                DataSource =
                    $"(DESCRIPTION="
                    + $"(ADDRESS=(PROTOCOL=TCP)(HOST={request.Host})(PORT={request.Port}))"
                    + $"(CONNECT_DATA=(SID={request.Database})))",
            };

            return builder.ConnectionString;
        }
    }
}
