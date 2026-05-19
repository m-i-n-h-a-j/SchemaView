using SchemaView.Application.Enums;

namespace SchemaView.Application.DTOs
{
    public sealed class DatabaseConnectionDto
    {
        public DatabaseProvider Provider { get; set; }
        public string Host { get; set; } = default!;
        public int Port { get; set; }
        public string Database { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
        public bool Ssl { get; set; }
    }
}
