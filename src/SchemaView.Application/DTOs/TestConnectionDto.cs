namespace SchemaView.Application.DTOs
{
    public sealed class TestConnectionRequestDto
    {
        public string Provider { get; set; } = default!;
        public string Host { get; set; } = default!;
        public int Port { get; set; }
        public string Database { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
        public bool Ssl { get; set; }
    }
}
