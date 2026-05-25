using Scalar.AspNetCore;
using SchemaView.Application.Interfaces;
using SchemaView.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
    );
});
builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });
builder.Services.AddOpenApi();
builder.Services.AddScoped<IConnectionService, ConnectionService>();
builder.Services.AddScoped<IDatabaseProvider, DatabaseProviderService>();
builder.Services.AddScoped<PostgreSqlProviderService>();
builder.Services.AddScoped<OracleProviderService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowAll");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();
