using BLL;
using DAL;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Đăng ký các service cho DI
builder.Services.AddSingleton<DatabaseHelper>();
builder.Services.AddScoped<AuthenticationDAL>();
builder.Services.AddScoped<AuthenticationBLL>();
builder.Services.AddScoped<BanDAL>();
builder.Services.AddScoped<BanBLL>();
builder.Services.AddScoped<EmployeesDAL>();
builder.Services.AddScoped<EmployeesBLL>();
builder.Services.AddScoped<InventoryDAL>();
builder.Services.AddScoped<InventoryBLL>();
builder.Services.AddScoped<InvoiceDAL>();
builder.Services.AddScoped<InvoiceBLL>();
builder.Services.AddScoped<OrderDAL>();
builder.Services.AddScoped<OrderBLL>();
builder.Services.AddScoped<ProductDAL>();
builder.Services.AddScoped<ProductBLL>();
builder.Services.AddScoped<SuppliersDAL>();
builder.Services.AddScoped<SuppliersBLL>();
builder.Services.AddScoped<ReportsDAL>();
builder.Services.AddScoped<ReportsBLL>();


// Thêm session support
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    // Cấu hình cho HTTP (không yêu cầu HTTPS)
    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
    options.Cookie.SameSite = SameSiteMode.Lax;
});

// Thêm cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Bật Swagger cho tất cả environment, không chỉ Development
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Quan Ly Cafe API V1");
    c.RoutePrefix = "swagger";
});

// Sử dụng CORS
app.UseCors();

// Thêm session middleware
app.UseSession();

app.UseAuthorization();

app.MapControllers();

app.Run();