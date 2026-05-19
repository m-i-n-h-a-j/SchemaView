using SchemaView.Application.DTOs;
using SchemaView.Domain.Common;

namespace SchemaView.Application.Interfaces
{
    public interface IConnectionService
    {
        Task<Result> TestConnectionAsync(TestConnectionRequestDto request);
    }
}
