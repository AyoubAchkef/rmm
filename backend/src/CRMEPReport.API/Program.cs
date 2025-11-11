using CRMEPReport.API.Data;
using CRMEPReport.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Configure Entity Framework with SQL Server - DISABLED for file-based system
// Uncomment if you need database-based storage
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlServer(
//         builder.Configuration.GetConnectionString("DefaultConnection"),
//         sqlOptions => sqlOptions.EnableRetryOnFailure(
//             maxRetryCount: 5,
//             maxRetryDelay: TimeSpan.FromSeconds(30),
//             errorNumbersToAdd: null
//         )
//     )
// );

// Register application services
// builder.Services.AddScoped<IReportService, ReportService>(); // Database-based service - DISABLED
builder.Services.AddScoped<IFileSystemReportService, FileSystemReportService>(); // File-based service

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000",
                "http://localhost:3001",
                "https://localhost:3001",
                "http://localhost:3003",
                "https://localhost:3003"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "CR MEP Report API",
        Version = "v1",
        Description = "API for managing CR MEP (Compte Rendu Mise En Production) reports"
    });
});

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "CR MEP Report API v1");
        options.RoutePrefix = "swagger";
    });
}

// Global exception handling
app.UseExceptionHandler("/error");

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();

// Map health check endpoint
app.MapHealthChecks("/health");

// Auto-migrate database on startup (development only) - DISABLED for file-based system
// Uncomment if you need database-based storage
// if (app.Environment.IsDevelopment())
// {
//     using var scope = app.Services.CreateScope();
//     var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//     dbContext.Database.Migrate();
// }

app.Run();
