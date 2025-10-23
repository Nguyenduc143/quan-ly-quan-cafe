# API Gateway - H??ng D?n S? D?ng

## T?ng Quan
API Gateway s? d?ng Ocelot ?? ??nh tuy?n c�c request ??n c�c microservices t??ng ?ng:
- **Admin API**: Ch?y tr�n port 5092
- **Staff API**: Ch?y tr�n port 5229
- **Gateway**: Ch?y tr�n port 5000

## C�ch Ch?y

### 1. Kh?i ??ng c�c services theo th? t?:

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

## C?u Tr�c Routes

### Admin API Routes (Prefix: `/admin`)

#### Authentication
- `POST /admin/api/Authentication/login` - ??ng nh?p
- `POST /admin/api/Authentication/logout` - ??ng xu?t
- `GET /admin/api/Authentication/me` - Th�ng tin user hi?n t?i
- `POST /admin/api/Authentication/change-password` - ??i m?t kh?u
- `POST /admin/api/Authentication/register` - ??ng k� t�i kho?n m?i (Admin only)
- `GET /admin/api/Authentication/status` - Tr?ng th�i ??ng nh?p
- `GET /admin/api/Authentication/accounts` - Danh s�ch t�i kho?n (Admin only)

#### Product (M�n ?n & Danh m?c)
- `GET /admin/api/Product/monan` - L?y t?t c? m�n ?n
- `GET /admin/api/Product/danhmuc` - L?y t?t c? danh m?c
- `GET /admin/api/Product/monan/danhmuc/{id}` - L?y m�n ?n theo danh m?c
- `POST /admin/api/Product/monan` - Th�m m�n ?n
- `PUT /admin/api/Product/monan` - C?p nh?t m�n ?n
- `DELETE /admin/api/Product/monan/{id}` - X�a m�n ?n
- `POST /admin/api/Product/danhmuc` - Th�m danh m?c
- `PUT /admin/api/Product/danhmuc` - C?p nh?t danh m?c

#### Employees (Nh�n vi�n)
- `GET /admin/api/Employees` - L?y danh s�ch nh�n vi�n
- `GET /admin/api/Employees/{id}` - L?y th�ng tin nh�n vi�n
- `POST /admin/api/Employees` - Th�m nh�n vi�n
- `PUT /admin/api/Employees/{id}` - C?p nh?t nh�n vi�n
- `DELETE /admin/api/Employees/{id}` - X�a nh�n vi�n

#### Ban (B�n)
- `GET /admin/api/Ban` - L?y danh s�ch b�n
- `GET /admin/api/Ban/{id}` - L?y th�ng tin b�n
- `POST /admin/api/Ban` - Th�m b�n
- `PUT /admin/api/Ban/{id}` - C?p nh?t b�n
- `DELETE /admin/api/Ban/{id}` - X�a b�n

#### Order (H�a ??n)
- `GET /admin/api/Order` - L?y danh s�ch h�a ??n
- `GET /admin/api/Order/{id}` - L?y chi ti?t h�a ??n
- `POST /admin/api/Order` - T?o h�a ??n
- `PUT /admin/api/Order/{id}` - C?p nh?t h�a ??n
- `DELETE /admin/api/Order/{id}` - X�a h�a ??n

#### Inventory (Kho)
- `GET /admin/api/Inventory` - L?y danh s�ch nguy�n li?u
- `GET /admin/api/Inventory/{id}` - L?y th�ng tin nguy�n li?u
- `POST /admin/api/Inventory` - Th�m nguy�n li?u
- `PUT /admin/api/Inventory/{id}` - C?p nh?t nguy�n li?u
- `DELETE /admin/api/Inventory/{id}` - X�a nguy�n li?u

#### Suppliers (Nh� cung c?p)
- `GET /admin/api/Suppliers` - L?y danh s�ch nh� cung c?p
- `GET /admin/api/Suppliers/{id}` - L?y th�ng tin nh� cung c?p
- `POST /admin/api/Suppliers` - Th�m nh� cung c?p
- `PUT /admin/api/Suppliers/{id}` - C?p nh?t nh� cung c?p
- `DELETE /admin/api/Suppliers/{id}` - X�a nh� cung c?p

#### Reports (B�o c�o)
- `GET /admin/api/Reports/{everything}` - C�c endpoint b�o c�o

#### Invoice (Phi?u nh?p)
- `GET /admin/api/Invoice` - L?y danh s�ch phi?u nh?p
- `GET /admin/api/Invoice/{id}` - L?y chi ti?t phi?u nh?p
- `POST /admin/api/Invoice` - T?o phi?u nh?p
- `PUT /admin/api/Invoice/{id}` - C?p nh?t phi?u nh?p
- `DELETE /admin/api/Invoice/{id}` - X�a phi?u nh?p

### Staff API Routes (Prefix: `/staff`)

#### Authentication
- `POST /staff/api/Authentication/login` - ??ng nh?p
- `POST /staff/api/Authentication/logout` - ??ng xu?t
- `GET /staff/api/Authentication/me` - Th�ng tin user hi?n t?i
- `POST /staff/api/Authentication/change-password` - ??i m?t kh?u
- `GET /staff/api/Authentication/status` - Tr?ng th�i ??ng nh?p

#### Ban (B�n)
- `GET /staff/api/Ban` - L?y danh s�ch b�n
- `GET /staff/api/Ban/{id}` - L?y th�ng tin b�n

#### Order (H�a ??n)
- `GET /staff/api/Order` - L?y danh s�ch h�a ??n
- `GET /staff/api/Order/{id}` - L?y chi ti?t h�a ??n
- `POST /staff/api/Order` - T?o h�a ??n
- `PUT /staff/api/Order/{id}` - C?p nh?t h�a ??n
- `DELETE /staff/api/Order/{id}` - X�a h�a ??n

## V� D? S? D?ng

### ??ng nh?p Admin
```bash
curl -X POST http://localhost:5000/admin/api/Authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenDangNhap": "admin",
    "matKhau": "password"
  }'
```

### L?y danh s�ch m�n ?n (qua Gateway)
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

### L?y danh s�ch b�n (Staff - qua Gateway)
```bash
curl -X GET http://localhost:5000/staff/api/Ban
```

## L?u �

1. **Th? t? kh?i ??ng**: Ph?i kh?i ??ng Admin API v� Staff API tr??c khi kh?i ??ng Gateway
2. **Port**: 
   - Gateway: 5000
   - Admin API: 5092
   - Staff API: 5229
3. **CORS**: ?� ???c c?u h�nh cho ph�p t?t c? origins
4. **Session**: M?i service qu?n l� session ri�ng, ch?a c� shared session

## C?u H�nh

File c?u h�nh routes: `ocelot.json`

?? thay ??i port ho?c th�m routes m?i, ch?nh s?a file `ocelot.json` v� restart Gateway.

## Troubleshooting

### Gateway kh�ng k?t n?i ???c v?i services
- Ki?m tra Admin API v� Staff API ?� ch?y ch?a
- Ki?m tra port trong `ocelot.json` kh?p v?i `launchSettings.json` c?a t?ng service

### CORS errors
- ?� c?u h�nh AllowAnyOrigin trong c? 3 services

### Route kh�ng ho?t ??ng
- Ki?m tra c?u tr�c route trong `ocelot.json`
- ??m b?o UpstreamPathTemplate v� DownstreamPathTemplate ?�ng format
