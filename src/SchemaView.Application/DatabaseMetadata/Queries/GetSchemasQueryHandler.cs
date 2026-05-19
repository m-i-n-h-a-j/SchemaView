using MediatR;
using SchemaView.Application.DTOs;
using SchemaView.Domain.DatabaseMetadata.Services;

namespace SchemaView.Application.DatabaseMetadata.Queries
{
    public sealed class GetSchemasQueryHandler(IDatabaseMetadataService metadataService)
        : IRequestHandler<GetSchemasQuery, IReadOnlyCollection<SchemaDto>>
    {
        public async Task<IReadOnlyCollection<SchemaDto>> Handle(
            GetSchemasQuery request,
            CancellationToken cancellationToken
        )
        {
            var schemas = await metadataService.GetSchemasAsync(
                request.ConnectionId,
                cancellationToken
            );

            return [.. schemas.Select(x => new SchemaDto { Name = x.Name })];
        }
    }
}
