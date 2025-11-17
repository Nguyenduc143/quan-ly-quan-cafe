# 🔧 HƯỚNG DẪN SỬA LỖI BACKEND - ✅ ĐÃ HOÀN THÀNH

> **⚠️ LƯU Ý:** Backend đã được sửa xong! File này giờ là tài liệu tham khảo.

---

## ✅ ĐÃ SỬA XONG

### **Backend (ASP.NET Core):**
- ✅ Đã thêm `app.UseAuthentication()` và `app.UseAuthorization()` vào `Program.cs`
- ✅ JWT Authentication hoạt động đúng
- ✅ Password được hash với BCrypt
- ✅ Error handling đầy đủ
- ✅ Response format chuẩn

### **Frontend (AngularJS):**
- ✅ Đã cập nhật `AuthService.js` với better error handling
- ✅ Đã cải thiện `AuthController.js` với better UX
- ✅ Enhanced logging với emoji icons
- ✅ Security improvements (clear password after login)
- ✅ Support multiple response formats từ backend

---

## 📄 TÀI LIỆU THAM KHẢO

### **Backend Documentation:**
Xem các file trong folder backend:
- `AUTHENTICATION_FIX_GUIDE.md` - Chi tiết fix authentication
- `PASSWORD_HASHING_GUIDE.md` - Hướng dẫn password hashing
- `TEST_AUTHENTICATION.md` - Test backend API

### **Frontend Documentation:**
- [`TEST_AUTH_FRONTEND.md`](TEST_AUTH_FRONTEND.md) - ✅ **MỚI!** Test authentication ở frontend

---

## ❌ VẤN ĐỀ BAN ĐẦU (ĐÃ FIX)

### Lỗi 1: Authentication Middleware Chưa Được Cấu Hình (500 Error)

```
System.InvalidOperationException: No authentication handlers are registered. 
Did you forget to call AddAuthentication().Add[SomeAuthHandler]("Chỉ admin mới có quyền tạo tài khoản mới",...)?
```

**Endpoint gặp lỗi:**
- `POST /admin/api/Authentication/register`

---

### Lỗi 2: Employee Account Not Found (404 Error)

```
GET /admin/api/Employees/8/account → 404 Not Found
```

**Nguyên nhân:** Nhân viên ID 8 chưa có tài khoản trong database.

---

## ✅ GIẢI PHÁP

### 1. Sửa Lỗi Authentication Configuration

#### **Bước 1: Thêm Package (nếu chưa có)**

```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

#### **Bước 2: Cấu hình trong `Program.cs` hoặc `Startup.cs`**

**A. Trong `appsettings.json` - Thêm cấu hình JWT:**

```json
{
  "Jwt": {
    "Key": "your-secret-key-min-32-characters-long!!!",
    "Issuer": "YourAppIssuer",
    "Audience": "YourAppAudience",
    "ExpireMinutes": 60
  }
}
```

**B. Trong `Program.cs` (hoặc `Startup.cs`):**

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ========== THÊM PHẦN NÀY ==========

// 1. Add Authentication Service
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Chỉ cho development
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] 
                ?? throw new InvalidOperationException("JWT Key not configured"))
        ),
        ClockSkew = TimeSpan.Zero
    };
});

// 2. Add Authorization Service
builder.Services.AddAuthorization();

// ====================================

// Add controllers, swagger, etc...
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ========== THÊM 2 DÒNG NÀY (QUAN TRỌNG) ==========
app.UseAuthentication();  // ⚠️ Phải đặt TRƯỚC UseAuthorization
app.UseAuthorization();
// ==================================================

app.MapControllers();

app.Run();
```

#### **Bước 3: Cập nhật Controller**

**Trong `AuthenticationController.cs`:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthenticationController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly YourDbContext _context; // Your database context
    
    public AuthenticationController(IConfiguration configuration, YourDbContext context)
    {
        _configuration = configuration;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Validate user credentials
        var user = await _context.NhanViens
            .FirstOrDefaultAsync(u => u.TenDangNhap == request.TenDangNhap 
                                   && u.MatKhau == request.MatKhau);
        
        if (user == null)
        {
            return Unauthorized(new { 
                success = false, 
                message = "Tên đăng nhập hoặc mật khẩu không đúng" 
            });
        }

        // Generate JWT token
        var token = GenerateJwtToken(user);
        
        return Ok(new
        {
            success = true,
            token = token,
            idNhanVien = user.IdNhanVien,
            tenDangNhap = user.TenDangNhap,
            tenNhanVien = user.TenNhanVien,
            loaiTaikhoan = user.LoaiTaiKhoan,
            message = "Đăng nhập thành công"
        });
    }

    [HttpPost("register")]
    [Authorize] // ⚠️ Yêu cầu authentication
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Check if username exists
        if (await _context.TaiKhoans.AnyAsync(t => t.TenDangNhap == request.TenDangNhap))
        {
            return BadRequest(new { 
                success = false, 
                message = "Tên đăng nhập đã tồn tại" 
            });
        }

        // Create new account
        var newAccount = new TaiKhoan
        {
            TenDangNhap = request.TenDangNhap,
            MatKhau = request.MatKhau, // ⚠️ Nên hash password
            LoaiTaiKhoan = request.LoaiTaiKhoan,
            IdNhanVien = request.IdNhanVien,
            TrangThai = true
        };

        _context.TaiKhoans.Add(newAccount);
        await _context.SaveChangesAsync();

        return Ok(new { 
            success = true, 
            message = "Tạo tài khoản thành công",
            data = newAccount
        });
    }

    // Helper method to generate JWT token
    private string GenerateJwtToken(NhanVien user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.IdNhanVien.ToString()),
            new Claim(ClaimTypes.Name, user.TenDangNhap),
            new Claim(ClaimTypes.GivenName, user.TenNhanVien),
            new Claim(ClaimTypes.Role, GetRoleName(user.LoaiTaiKhoan))
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(
                int.Parse(_configuration["Jwt:ExpireMinutes"] ?? "60")
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GetRoleName(int loaiTaiKhoan)
    {
        return loaiTaiKhoan switch
        {
            1 => "Admin",
            2 => "Cashier",
            3 => "Barista",
            4 => "Waiter",
            _ => "Employee"
        };
    }
}

// Request models
public class LoginRequest
{
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string TenDangNhap { get; set; } = string.Empty;
    public string MatKhau { get; set; } = string.Empty;
    public int LoaiTaiKhoan { get; set; }
    public int IdNhanVien { get; set; }
}
```

---

### 2. Sửa Lỗi Employee Account Not Found (404)

#### **Option A: Tạo Account cho Employee ID 8**

```sql
-- Thêm tài khoản cho nhân viên ID 8
INSERT INTO TaiKhoan (IdNhanVien, TenDangNhap, MatKhau, LoaiTaiKhoan, TrangThai)
VALUES (8, 'nhanvien8', 'password123', 0, 1);
```

#### **Option B: Update Controller để handle trường hợp không có account**

```csharp
[HttpGet("{id}/account")]
public async Task<IActionResult> GetEmployeeAccount(int id)
{
    var account = await _context.TaiKhoans
        .Where(t => t.IdNhanVien == id)
        .FirstOrDefaultAsync();
    
    if (account == null)
    {
        // Trả về thông báo thân thiện thay vì 404
        return Ok(new 
        { 
            success = false,
            message = "Nhân viên chưa có tài khoản",
            data = new 
            {
                idNhanVien = id,
                hasAccount = false
            }
        });
    }
    
    return Ok(new 
    { 
        success = true,
        data = account 
    });
}
```

---

## 🧪 TESTING

### Test Authentication Endpoint:

```bash
# Test Login
curl -X POST http://localhost:5092/api/Authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenDangNhap": "admin",
    "matKhau": "admin123"
  }'

# Test Register (with token)
curl -X POST http://localhost:5092/api/Authentication/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "tenDangNhap": "nhanvien8",
    "matKhau": "password123",
    "loaiTaiKhoan": 0,
    "idNhanVien": 8
  }'
```

---

## 📝 CHECKLIST

- [ ] Đã thêm package `Microsoft.AspNetCore.Authentication.JwtBearer`
- [ ] Đã thêm cấu hình JWT vào `appsettings.json`
- [ ] Đã thêm `AddAuthentication()` và `AddJwtBearer()` vào `Program.cs`
- [ ] Đã thêm `app.UseAuthentication()` TRƯỚC `app.UseAuthorization()`
- [ ] Đã cập nhật controller với `[Authorize]` attribute
- [ ] Đã test login endpoint
- [ ] Đã test register endpoint với token
- [ ] Đã tạo account cho các employee còn thiếu

---

## 🚀 SAU KHI SỬA

1. **Build lại project:**
   ```bash
   dotnet build
   ```

2. **Chạy lại API:**
   ```bash
   dotnet run
   ```

3. **Test trên Frontend:**
   - Đăng nhập
   - Thử tạo tài khoản mới cho nhân viên
   - Kiểm tra console không còn lỗi 500

---

## ❓ NẾU VẪN GẶP LỖI

1. Kiểm tra console output của backend khi start
2. Đảm bảo JWT Key có ít nhất 32 ký tự
3. Kiểm tra thứ tự middleware trong pipeline
4. Verify database connection string
5. Check CORS configuration nếu có lỗi CORS

---

**Người tạo:** GitHub Copilot  
**Ngày:** 16/11/2025
