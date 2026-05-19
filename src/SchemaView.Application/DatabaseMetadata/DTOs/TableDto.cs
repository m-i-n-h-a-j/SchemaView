namespace SchemaView.Application.DTOs
{
    public sealed class GetSchemasQuery
    {
        public required string Schema { get; init; }
        public required string Name { get; init; }
    }
}
