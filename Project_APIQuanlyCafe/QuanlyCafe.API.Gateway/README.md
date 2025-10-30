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
- `PATCH /admin/api/Order/{id}/status` - C?p nh?t tr?ng thái hóa ??n
- `GET /admin/api/Order/table/{tableId}` - L?y hóa ??n theo bàn

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

#### Invoices (Hóa ??n ?ã thanh toán)
- `GET /admin/api/Invoices` - L?y danh sách hóa ??n ?ã thanh toán
- `GET /admin/api/Invoices/{id}` - L?y chi ti?t hóa ??n ?ã thanh toán
- `POST /admin/api/Invoices/{id}/print` - In hóa ??n ?ã thanh toán

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
- `PATCH /staff/api/Order/{id}/status` - C?p nh?t tr?ng thái hóa ??n
- `GET /staff/api/Order/table/{tableId}` - L?y hóa ??n theo bàn

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

## API H??ng D?n Chi Ti?t

### PATCH Order API - C?p nh?t tr?ng thái hóa ??n

#### Admin - C?p nh?t tr?ng thái hóa ??n
```bash
curl -X PATCH http://localhost:5000/admin/api/Order/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "trangThaiHD": 1,
    "thoiDiemRa": "2024-01-15T14:30:00"
  }'
```

**Request Body:**
```json
{
  "trangThaiHD": 1,         // 0: Ch?a thanh toán, 1: ?ã thanh toán
  "thoiDiemRa": "2024-01-15T14:30:00"  // Th?i ?i?m ra (optional)
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "C?p nh?t tr?ng thái ??n hàng thành công - ?ã thanh toán",
  "data": null
}
```

#### Staff - C?p nh?t tr?ng thái hóa ??n
```bash
curl -X PATCH http://localhost:5000/staff/api/Order/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "trangThaiHD": 1,
    "thoiDiemRa": "2024-01-15T14:30:00"
  }'
```

### Invoices API - Qu?n lý hóa ??n ?ã thanh toán

#### L?y danh sách hóa ??n ?ã thanh toán
```bash
curl -X GET http://localhost:5000/admin/api/Invoices
```

**Response:**
```json
{
  "success": true,
  "message": "L?y danh sách hóa ??n thành công",
  "data": [
    {
      "id": 1,
      "thoiDiemVao": "2024-01-15T12:00:00",
      "thoiDiemRa": "2024-01-15T14:30:00",
      "idBanAn": 5,
      "trangThaiHD": 1,
      "idNhanVien": 2,
      "chiTietHoaDon": [
        {
          "idHoaDonBan": 1,
          "idMonAn": 10,
          "soLuong": 2
        }
      ]
    }
  ]
}
```

#### L?y chi ti?t hóa ??n ?ã thanh toán
```bash
curl -X GET http://localhost:5000/admin/api/Invoices/1
```

**Response:**
```json
{
  "success": true,
  "message": "L?y chi ti?t hóa ??n thành công",
  "data": {
    "id": 1,
    "thoiDiemVao": "2024-01-15T12:00:00",
    "thoiDiemRa": "2024-01-15T14:30:00",
    "idBanAn": 5,
    "trangThaiHD": 1,
    "idNhanVien": 2,
    "chiTietHoaDon": [
      {
        "idHoaDonBan": 1,
        "idMonAn": 10,
        "soLuong": 2
      }
    ]
  }
}
```

#### In hóa ??n ?ã thanh toán
```bash
curl -X POST http://localhost:5000/admin/api/Invoices/1/print
```

**Response:**
```json
{
  "success": true,
  "message": "L?y thông tin hóa ??n ?? in thành công",
  "data": {
    "id": 1,
    "thoiDiemVao": "2024-01-15T12:00:00",
    "thoiDiemRa": "2024-01-15T14:30:00",
    "idBanAn": 5,
    "tenBanAn": "Bàn 5",
    "tenNhanVien": "Nguy?n V?n A",
    "chiTietHoaDon": [
      {
        "idHoaDonBan": 1,
        "idMonAn": 10,
        "soLuong": 2
      }
    ],
    "tongTien": 150000
  },
  "printTime": "2024-01-15T15:00:00"
}
```

### T?o hóa ??n m?i

#### Admin - T?o hóa ??n
```bash
curl -X POST http://localhost:5000/admin/api/Order \
  -H "Content-Type: application/json" \
  -d '{
    "idBan": 5,
    "idNhanVien": 2,
    "chiTietHoaDonBan": [
      {
        "idMonAn": 10,
        "soLuong": 2
      },
      {
        "idMonAn": 15,
        "soLuong": 1
      }
    ]
  }'
```

#### Staff - T?o hóa ??n
```bash
curl -X POST http://localhost:5000/staff/api/Order \
  -H "Content-Type: application/json" \
  -d '{
    "idBan": 3,
    "idNhanVien": 1,
    "chiTietHoaDonBan": [
      {
        "idMonAn": 8,
        "soLuong": 1
      }
    ]
  }'
```

### L?y hóa ??n theo bàn

#### Admin - L?y hóa ??n theo bàn
```bash
curl -X GET http://localhost:5000/admin/api/Order/table/5
```

#### Staff - L?y hóa ??n theo bàn
```bash
curl -X GET http://localhost:5000/staff/api/Order/table/5
```

## L?u Ý

1. **Th? t? kh?i ??ng**: Ph?i kh?i ??ng Admin API và Staff API tr??c khi kh?i ??ng Gateway
2. **Port**: 
   - Gateway: 5000
   - Admin API: 5092
   - Staff API: 5229
3. **CORS**: ?ã ???c c?u hình cho phép t?t c? origins
4. **Session**: M?i service qu?n lý session riêng, ch?a có shared session
5. **Tr?ng thái hóa ??n**: 
   - `0`: Ch?a thanh toán
   - `1`: ?ã thanh toán
6. **Invoices API**: Ch? hi?n th? các hóa ??n ?ã thanh toán (TrangThaiHD = 1)
7. **PATCH vs PUT**: 
   - `PATCH`: C?p nh?t m?t ph?n (ch? tr?ng thái)
   - `PUT`: C?p nh?t toàn b? thông tin hóa ??n

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

### PATCH API không ho?t ??ng
- ??m b?o `"Patch"` ???c thêm vào `UpstreamHttpMethod` trong `ocelot.json`
- Ki?m tra request body ?úng format JSON
- Validate tr?ng thái hóa ??n (ch? ch?p nh?n 0 ho?c 1)

### Invoices API tr? v? empty
- Ch? hi?n th? hóa ??n ?ã thanh toán (TrangThaiHD = 1)
- Ki?m tra có hóa ??n nào ?ã ???c thanh toán ch?a
