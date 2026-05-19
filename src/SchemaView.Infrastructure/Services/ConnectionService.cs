using Npgsql;
using SchemaView.Application.DTOs;
using SchemaView.Application.Interfaces;
using SchemaView.Domain.Common;

namespace SchemaView.Infrastructure.Services
{
    public class ConnectionService : IConnectionService
    {
        public async Task<Result> TestConnectionAsync(TestConnectionRequestDto request)
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
    }
}
