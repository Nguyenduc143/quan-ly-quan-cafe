using Microsoft.OpenApi.Models;
using DAL;
using BLL;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "QLyQuanCafe API", Version = "v1" });
});

// Register DatabaseHelper and BLL services
builder.Services.AddScoped<DatabaseHelper>();
builder.Services.AddScoped<BanDAL>();
builder.Services.AddScoped<BanBLL>();

var app = builder.Build();

// Configure the HTTP request pipeline.
// Enable Swagger for both Development and when using IIS Express
if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Development")
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QLyQuanCafe API V1");
        c.RoutePrefix = "swagger";
    });
}

app.UseAuthorization();

app.MapControllers();

app.Run();
