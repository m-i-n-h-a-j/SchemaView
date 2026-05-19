using Npgsql;
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
                var builder = new NpgsqlConnectionStringBuilder
                {
                    Host = request.Host,
                    Port = request.Port,
                    Database = request.Database,
                    Username = request.Username,
                    Password = request.Password,
                    SslMode = request.Ssl ? SslMode.Require : SslMode.Disable,
                };

                await using var connection = new NpgsqlConnection(builder.ConnectionString);

                await connection.OpenAsync();

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

                _ => throw new NotSupportedException(
                    $"Provider '{request.Provider}' is not supported.")
            };
        }

        private static string BuildPostgreSqlConnectionString(
            DatabaseConnectionDto request)
        {
            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = request.Host,
                Port = request.Port,
                Database = request.Database,
                Username = request.Username,
                Password = request.Password,
                SslMode = request.Ssl
                    ? SslMode.Require
                    : SslMode.Disable,
            };

            return builder.ConnectionString;
        }
    }
}
