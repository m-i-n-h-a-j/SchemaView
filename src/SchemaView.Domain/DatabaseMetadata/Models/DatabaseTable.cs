namespace SchemaView.Domain.DatabaseMetadata.Models
{
    public sealed class DatabaseTable
    {
        public required string Schema { get; init; }
        public required string Name { get; init; }
    }
}
