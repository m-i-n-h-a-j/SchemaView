using Scalar.AspNetCore;
using SchemaView.Application.Interfaces;
using SchemaView.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

#region CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowClients",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});
#endregion

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
builder.Services.AddScoped<PostgreSqlProviderService>();
builder.Services.AddScoped<OracleProviderService>();
builder.Services.AddScoped<IDatabaseProvider, DatabaseProviderService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowClients");
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();
