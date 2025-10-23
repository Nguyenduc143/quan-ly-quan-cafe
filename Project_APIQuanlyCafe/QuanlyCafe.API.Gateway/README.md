# API Gateway - H??ng D?n S? D?ng

## T?ng Quan
API Gateway s? d?ng Ocelot ?? ??nh tuy?n các request ??n các microservices t??ng ?ng:
- **Admin API**: Ch?y trên port 5092
- **Staff API**: Ch?y trên port 5229
- **Gateway**: Ch?y trên port 5000

## Cách Ch?y

### 1. Kh?i ??ng các services theo th? t?:

#### B??c 1: Kh?i ??ng Admin API
```bash
cd QuanlyCafe.API.Admin
dotnet run
```

#### B??c 2: Kh?i ??ng Staff API
```bash
cd QuanlyCafe.API.Staff
dotnet run
```

#### B??c 3: Kh?i ??ng Gateway
```bash
cd QuanlyCafe.API.Gateway
dotnet run
```

## C?u Trúc Routes

### Admin API Routes (Prefix: `/admin`)

#### Authentication
- `POST /admin/api/Authentication/login` - ??ng nh?p
- `POST /admin/api/Authentication/logout` - ??ng xu?t
- `GET /admin/api/Authentication/me` - Thông tin user hi?n t?i
- `POST /admin/api/Authentication/change-password` - ??i m?t kh?u
- `POST /admin/api/Authentication/register` - ??ng ký tài kho?n m?i (Admin only)
- `GET /admin/api/Authentication/status` - Tr?ng thái ??ng nh?p
- `GET /admin/api/Authentication/accounts` - Danh sách tài kho?n (Admin only)

#### Product (Món ?n & Danh m?c)
- `GET /admin/api/Product/monan` - L?y t?t c? món ?n
- `GET /admin/api/Product/danhmuc` - L?y t?t c? danh m?c
- `GET /admin/api/Product/monan/danhmuc/{id}` - L?y món ?n theo danh m?c
- `POST /admin/api/Product/monan` - Thêm món ?n
- `PUT /admin/api/Product/monan` - C?p nh?t món ?n
- `DELETE /admin/api/Product/monan/{id}` - Xóa món ?n
- `POST /admin/api/Product/danhmuc` - Thêm danh m?c
- `PUT /admin/api/Product/danhmuc` - C?p nh?t danh m?c

#### Employees (Nhân viên)
- `GET /admin/api/Employees` - L?y danh sách nhân viên
- `GET /admin/api/Employees/{id}` - L?y thông tin nhân viên
- `POST /admin/api/Employees` - Thêm nhân viên
- `PUT /admin/api/Employees/{id}` - C?p nh?t nhân viên
- `DELETE /admin/api/Employees/{id}` - Xóa nhân viên

#### Ban (Bàn)
- `GET /admin/api/Ban` - L?y danh sách bàn
- `GET /admin/api/Ban/{id}` - L?y thông tin bàn
- `POST /admin/api/Ban` - Thêm bàn
- `PUT /admin/api/Ban/{id}` - C?p nh?t bàn
- `DELETE /admin/api/Ban/{id}` - Xóa bàn

#### Order (Hóa ??n)
- `GET /admin/api/Order` - L?y danh sách hóa ??n
- `GET /admin/api/Order/{id}` - L?y chi ti?t hóa ??n
- `POST /admin/api/Order` - T?o hóa ??n
- `PUT /admin/api/Order/{id}` - C?p nh?t hóa ??n
- `DELETE /admin/api/Order/{id}` - Xóa hóa ??n

#### Inventory (Kho)
- `GET /admin/api/Inventory` - L?y danh sách nguyên li?u
- `GET /admin/api/Inventory/{id}` - L?y thông tin nguyên li?u
- `POST /admin/api/Inventory` - Thêm nguyên li?u
- `PUT /admin/api/Inventory/{id}` - C?p nh?t nguyên li?u
- `DELETE /admin/api/Inventory/{id}` - Xóa nguyên li?u

#### Suppliers (Nhà cung c?p)
- `GET /admin/api/Suppliers` - L?y danh sách nhà cung c?p
- `GET /admin/api/Suppliers/{id}` - L?y thông tin nhà cung c?p
- `POST /admin/api/Suppliers` - Thêm nhà cung c?p
- `PUT /admin/api/Suppliers/{id}` - C?p nh?t nhà cung c?p
- `DELETE /admin/api/Suppliers/{id}` - Xóa nhà cung c?p

#### Reports (Báo cáo)
- `GET /admin/api/Reports/{everything}` - Các endpoint báo cáo

#### Invoice (Phi?u nh?p)
- `GET /admin/api/Invoice` - L?y danh sách phi?u nh?p
- `GET /admin/api/Invoice/{id}` - L?y chi ti?t phi?u nh?p
- `POST /admin/api/Invoice` - T?o phi?u nh?p
- `PUT /admin/api/Invoice/{id}` - C?p nh?t phi?u nh?p
- `DELETE /admin/api/Invoice/{id}` - Xóa phi?u nh?p

### Staff API Routes (Prefix: `/staff`)

#### Authentication
- `POST /staff/api/Authentication/login` - ??ng nh?p
- `POST /staff/api/Authentication/logout` - ??ng xu?t
- `GET /staff/api/Authentication/me` - Thông tin user hi?n t?i
- `POST /staff/api/Authentication/change-password` - ??i m?t kh?u
- `GET /staff/api/Authentication/status` - Tr?ng thái ??ng nh?p

#### Ban (Bàn)
- `GET /staff/api/Ban` - L?y danh sách bàn
- `GET /staff/api/Ban/{id}` - L?y thông tin bàn

#### Order (Hóa ??n)
- `GET /staff/api/Order` - L?y danh sách hóa ??n
- `GET /staff/api/Order/{id}` - L?y chi ti?t hóa ??n
- `POST /staff/api/Order` - T?o hóa ??n
- `PUT /staff/api/Order/{id}` - C?p nh?t hóa ??n
- `DELETE /staff/api/Order/{id}` - Xóa hóa ??n

## Ví D? S? D?ng

### ??ng nh?p Admin
```bash
curl -X POST http://localhost:5000/admin/api/Authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenDangNhap": "admin",
    "matKhau": "password"
  }'
```

### L?y danh sách món ?n (qua Gateway)
```bash
curl -X GET http://localhost:5000/admin/api/Product/monan
```

### ??ng nh?p Staff
```bash
curl -X POST http://localhost:5000/staff/api/Authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenDangNhap": "staff",
    "matKhau": "password"
  }'
```

### L?y danh sách bàn (Staff - qua Gateway)
```bash
curl -X GET http://localhost:5000/staff/api/Ban
```

## L?u Ý

1. **Th? t? kh?i ??ng**: Ph?i kh?i ??ng Admin API và Staff API tr??c khi kh?i ??ng Gateway
2. **Port**: 
   - Gateway: 5000
   - Admin API: 5092
   - Staff API: 5229
3. **CORS**: ?ã ???c c?u hình cho phép t?t c? origins
4. **Session**: M?i service qu?n lý session riêng, ch?a có shared session

## C?u Hình

File c?u hình routes: `ocelot.json`

?? thay ??i port ho?c thêm routes m?i, ch?nh s?a file `ocelot.json` và restart Gateway.

## Troubleshooting

### Gateway không k?t n?i ???c v?i services
- Ki?m tra Admin API và Staff API ?ã ch?y ch?a
- Ki?m tra port trong `ocelot.json` kh?p v?i `launchSettings.json` c?a t?ng service

### CORS errors
- ?ã c?u hình AllowAnyOrigin trong c? 3 services

### Route không ho?t ??ng
- Ki?m tra c?u trúc route trong `ocelot.json`
- ??m b?o UpstreamPathTemplate và DownstreamPathTemplate ?úng format
