namespace SchemaView.Domain.Common
{
    public class Result
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public Error? Error { get; }

        protected Result(bool isSuccess, Error? error)
        {
            if (isSuccess && error is not null)
            {
                throw new InvalidOperationException("Success result cannot have error");
            }

            if (!isSuccess && error is null)
            {
                throw new InvalidOperationException("Failure result must have error");
            }

            IsSuccess = isSuccess;
            Error = error;
        }

        public static Result Success() => new(true, null);

        public static Result Failure(Error error) => new(false, error);
    }

    public class Result<T> : Result
    {
        private readonly T? _value;

        public T Value =>
            IsSuccess
                ? _value!
                : throw new InvalidOperationException("Cannot access value of a failure result");

        private Result(T? value, bool isSuccess, Error? error)
            : base(isSuccess, error)
        {
            _value = value;
        }

        public static Result<T> Success(T value)
        {
            if (value is null)
                return Fail(Error.NullValue);

            return new Result<T>(value, true, null);
        }

        public static Result<T> Fail(Error error) => new(default, false, error);

        public static implicit operator Result<T>(T value) => Success(value);

        public static implicit operator Result<T>(Error error) => Fail(error);

        public Result<TOut> Map<TOut>(Func<T, TOut> func)
        {
            return IsSuccess ? Result<TOut>.Success(func(Value)) : Result<TOut>.Fail(Error!);
        }

        public Result<TOut> Bind<TOut>(Func<T, Result<TOut>> func)
        {
            return IsSuccess ? func(Value) : Result<TOut>.Fail(Error!);
        }

        public Result<T> Tap(Action<T> action)
        {
            if (IsSuccess)
                action(Value);

            return this;
        }

        public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<Error, TOut> onFailure)
        {
            return IsSuccess ? onSuccess(Value) : onFailure(Error!);
        }
    }
}
