using MediatR;
using SchemaView.Application.DTOs;

namespace SchemaView.Application.DatabaseMetadata.Queries
{
    public sealed record GetSchemasQuery(string ConnectionId)
        : IRequest<IReadOnlyCollection<SchemaDto>>;
}
