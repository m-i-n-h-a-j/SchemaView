namespace SchemaView.Domain.Common
{
    public record Error(string Code, string Message)
    {
        public static readonly Error NullValue = new("General.Null", "A required value was null");

        public static readonly Error Validation = new(
            "General.Validation",
            "One or more validation errors occurred"
        );

        public static readonly Error NotFound = new(
            "General.NotFound",
            "The requested resource was not found"
        );

        public static readonly Error AlreadyExists = new(
            "General.AlreadyExists",
            "The resource already exists"
        );

        public static readonly Error Unauthorized = new(
            "General.Unauthorized",
            "Unauthorized access"
        );

        public static readonly Error Forbidden = new("General.Forbidden", "Forbidden");

        public static readonly Error Failure = new(
            "General.Failure",
            "An internal failure occurred"
        );
    }
}
