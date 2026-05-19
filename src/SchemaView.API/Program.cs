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

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<IConnectionService, ConnectionService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowClients");
app.UseAuthorization();
app.MapControllers();
app.Run();
