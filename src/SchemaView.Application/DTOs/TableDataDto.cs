namespace SchemaView.Application.DTOs
{
    public sealed class TableDataDto
    {
        public required string Schema { get; init; }
        public required string Table { get; init; }
        public required IReadOnlyCollection<ColumnDataDto> Columns { get; init; }
        public required IReadOnlyCollection<
            IReadOnlyDictionary<string, object?>
        > Rows
        { get; init; }
        public int TotalRows { get; init; }
    }
}
