using Microsoft.AspNetCore.Mvc;
using SchemaView.Domain.Common;

namespace SchemaView.API.Controllers
{
    [ApiController]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected IActionResult HandleResult<T>(Result<T> result)
        {
            if (result.IsSuccess)
                return Ok(result.Value);

            return HandleError(result.Error!);
        }

        protected IActionResult HandleResult(Result result)
        {
            if (result.IsSuccess)
                return NoContent();

            return HandleError(result.Error!);
        }

        private ObjectResult HandleError(Error error)
        {
            return error.Code switch
            {
                "General.NotFound" => NotFound(error),
                "General.Unauthorized" => Unauthorized(error),
                "General.Validation" => BadRequest(error),
                "General.AlreadyExists" => Conflict(error),
                _ => StatusCode(500, error),
            };
        }
    }
}
