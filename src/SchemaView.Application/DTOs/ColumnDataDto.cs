

namespace SchemaView.Application.DTOs
{
    public sealed class ColumnDataDto
    {
        public required string Name { get; init; }
        public required string DataType { get; init; }
        public bool IsNullable { get; init; }
    }
}
