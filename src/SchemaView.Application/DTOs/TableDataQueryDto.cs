namespace SchemaView.Application.DTOs
{
    public sealed class TableDataQueryDto
    {
        public int Offset { get; init; }
        public int Limit { get; init; } = 50;
        public string? SortColumn { get; init; }
        public string? SortDirection { get; init; }
    }
}
