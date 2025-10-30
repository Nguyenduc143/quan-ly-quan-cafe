# Postman Collection - API Gateway Testing

## Import vào Postman

T?o collection m?i trong Postman và thêm các request sau:

## Environment Variables
T?o environment v?i các bi?n sau:
- `gateway_url`: `http://localhost:5000`
- `admin_url`: `http://localhost:5092`
- `staff_url`: `http://localhost:5229`

---

## Admin API (qua Gateway)

### 1. Authentication

#### Login Admin
```
POST {{gateway_url}}/admin/api/Authentication/login
Content-Type: application/json

{
  "tenDangNhap": "admin",
  "matKhau": "123456"
}
```

#### Get Current User
```
GET {{gateway_url}}/admin/api/Authentication/me
```

#### Logout
```
POST {{gateway_url}}/admin/api/Authentication/logout
```

#### Get Login Status
```
GET {{gateway_url}}/admin/api/Authentication/status
```

### 2. Product Management

#### Get All Món ?n
```
GET {{gateway_url}}/admin/api/Product/monan
```

#### Get All Danh M?c
```
GET {{gateway_url}}/admin/api/Product/danhmuc
```

#### Get Món ?n by Danh M?c
```
GET {{gateway_url}}/admin/api/Product/monan/danhmuc/1
```

#### Add Món ?n
```
POST {{gateway_url}}/admin/api/Product/monan
Content-Type: application/json

{
  "tenMonAn": "Cà phê s?a",
  "idDanhMuc": 1,
  "donGia": 25000
}
```

#### Update Món ?n
```
PUT {{gateway_url}}/admin/api/Product/monan
Content-Type: application/json

{
  "id": 1,
  "tenMonAn": "Cà phê s?a ?á",
  "idDanhMuc": 1,
  "donGia": 30000
}
```

#### Delete Món ?n
```
DELETE {{gateway_url}}/admin/api/Product/monan/1
```

### 3. Employee Management

#### Get All Employees
```
GET {{gateway_url}}/admin/api/Employees
```

#### Get Employee by ID
```
GET {{gateway_url}}/admin/api/Employees/1
```

#### Add Employee
```
POST {{gateway_url}}/admin/api/Employees
Content-Type: application/json

{
  "tenNhanVien": "Nguy?n V?n A",
  "soDienThoai": "0123456789",
  "diaChi": "Hà N?i",
  "ngaySinh": "1990-01-01",
  "gioiTinh": "Nam",
  "chucVu": "Nhân viên"
}
```

#### Update Employee
```
PUT {{gateway_url}}/admin/api/Employees/1
Content-Type: application/json

{
  "id": 1,
  "tenNhanVien": "Nguy?n V?n A",
  "soDienThoai": "0987654321",
  "diaChi": "Hà N?i",
  "ngaySinh": "1990-01-01",
  "gioiTinh": "Nam",
  "chucVu": "Qu?n lý"
}
```

#### Delete Employee
```
DELETE {{gateway_url}}/admin/api/Employees/1
```

### 4. Table (Bàn) Management

#### Get All Tables
```
GET {{gateway_url}}/admin/api/Ban
```

#### Get Table by ID
```
GET {{gateway_url}}/admin/api/Ban/1
```

#### Add Table
```
POST {{gateway_url}}/admin/api/Ban
Content-Type: application/json

{
  "tenBan": "Bàn 1",
  "trangThai": 0
}
```

#### Update Table
```
PUT {{gateway_url}}/admin/api/Ban/1
Content-Type: application/json

{
  "id": 1,
  "tenBan": "Bàn VIP 1",
  "trangThai": 1
}
```

#### Delete Table
```
DELETE {{gateway_url}}/admin/api/Ban/1
```

### 5. Order Management

#### Get All Orders
```
GET {{gateway_url}}/admin/api/Order
```

#### Get Order by ID
```
GET {{gateway_url}}/admin/api/Order/1
```

#### Create Order
```
POST {{gateway_url}}/admin/api/Order
Content-Type: application/json

{
  "idBan": 1,
  "idNhanVien": 1,
  "chiTietHoaDonBan": [
    {
      "idMonAn": 1,
      "soLuong": 2
    },
    {
      "idMonAn": 2,
      "soLuong": 1
    }
  ]
}
```

#### Update Order
```
PUT {{gateway_url}}/admin/api/Order/1
Content-Type: application/json

{
  "thoiDiemRa": "2024-01-01T12:00:00",
  "idNhanVien": 1,
  "chiTietHoaDonBan": [
    {
      "idMonAn": 1,
      "soLuong": 3
    }
  ]
}
```

### 6. Suppliers Management

#### Get All Suppliers
```
GET {{gateway_url}}/admin/api/Suppliers
```

#### Get Supplier by ID
```
GET {{gateway_url}}/admin/api/Suppliers/1
```

#### Add Supplier
```
POST {{gateway_url}}/admin/api/Suppliers
Content-Type: application/json

{
  "tenNhaCungCap": "Công ty ABC",
  "soDienThoai": "0123456789",
  "diaChi": "Hà N?i",
  "email": "abc@example.com"
}
```

### 7. Inventory Management

#### Get All Inventory
```
GET {{gateway_url}}/admin/api/Inventory
```

#### Get Inventory by ID
```
GET {{gateway_url}}/admin/api/Inventory/1
```

#### Add Inventory Item
```
POST {{gateway_url}}/admin/api/Inventory
Content-Type: application/json

{
  "tenNguyenLieu": "Cà phê h?t",
  "donViTinh": "kg",
  "soLuongTon": 100,
  "giaNhap": 150000
}
```

---

## Staff API (qua Gateway)

### 1. Authentication

#### Login Staff
```
POST {{gateway_url}}/staff/api/Authentication/login
Content-Type: application/json

{
  "tenDangNhap": "staff01",
  "matKhau": "123456"
}
```

#### Get Current User
```
GET {{gateway_url}}/staff/api/Authentication/me
```

#### Logout
```
POST {{gateway_url}}/staff/api/Authentication/logout
```

### 2. Table (Bàn) - Read Only

#### Get All Tables
```
GET {{gateway_url}}/staff/api/Ban
```

#### Get Table by ID
```
GET {{gateway_url}}/staff/api/Ban/1
```

### 3. Order Management

#### Get All Orders
```
GET {{gateway_url}}/staff/api/Order
```

#### Get Order by ID
```
GET {{gateway_url}}/staff/api/Order/1
```

#### Create Order
```
POST {{gateway_url}}/staff/api/Order
Content-Type: application/json

{
  "idBan": 1,
  "idNhanVien": 1,
  "chiTietHoaDonBan": [
    {
      "idMonAn": 1,
      "soLuong": 2
    }
  ]
}
```

#### Update Order
```
PUT {{gateway_url}}/staff/api/Order/1
Content-Type: application/json

{
  "thoiDiemRa": "2024-01-01T12:00:00",
  "idNhanVien": 1,
  "chiTietHoaDonBan": [
    {
      "idMonAn": 1,
      "soLuong": 3
    }
  ]
}
```

---

## Testing Flow

### 1. Test Admin Flow
1. Login as Admin
2. Get all products
3. Create a new product
4. Update the product
5. Get all employees
6. Create an order
7. Logout

### 2. Test Staff Flow
1. Login as Staff
2. Get all tables
3. Get available tables
4. Create an order for a table
5. Update the order
6. Logout

### 3. Test Gateway Routing
1. Call the same endpoint directly to Admin API: `http://localhost:5092/api/Product/monan`
2. Call through Gateway: `http://localhost:5000/admin/api/Product/monan`
3. Compare responses - should be identical

---

## Tips

1. **Save Response Variables**: Trong Postman, b?n có th? l?u ID t? response ?? dùng cho request ti?p theo:
```javascript
// Tests tab in Postman
var jsonData = pm.response.json();
pm.environment.set("employee_id", jsonData.id);
```

2. **Authentication**: N?u API yêu c?u authentication, thêm header:
```
Cookie: [session-cookie]
```

3. **Check Gateway Logs**: Xem console c?a Gateway ?? debug routing issues

4. **Performance Testing**: So sánh response time khi call tr?c ti?p vs qua Gateway
