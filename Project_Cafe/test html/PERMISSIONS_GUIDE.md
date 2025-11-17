# 🔐 Hướng dẫn sử dụng Phân quyền

## Đăng nhập với các tài khoản

### Quản lý (Full Access)
- **Quyền**: Toàn quyền truy cập và chỉnh sửa
- **Trang Nhân viên**: ✅ Có quyền truy cập
- **Trang Kho**: ✅ Có quyền Thêm/Sửa/Xóa

### Nhân viên (Limited Access)
- **Quyền**: Chỉ xem
- **Trang Nhân viên**: ❌ Không truy cập được
- **Trang Kho**: ✅ Chỉ xem (Read-only)

---

## Kiểm tra vai trò hiện tại

Mở **Browser Console** (F12) và gõ:

```javascript
// Xem thông tin user hiện tại
JSON.parse(localStorage.getItem('currentUser'))

// Kiểm tra role
JSON.parse(localStorage.getItem('currentUser')).role
```

---

## Tính năng đã triển khai

### ✅ Trang Nhân viên (`#!/employees`)
- Chỉ **Quản lý** được truy cập
- Menu "Nhân viên" tự động ẩn với người dùng không phải Quản lý
- Nếu cố truy cập trực tiếp → chuyển về Dashboard + thông báo lỗi

### ✅ Trang Menu (`#!/menu`)
- **Tất cả** được xem menu
- **Quản lý**: Thấy nút Thêm món mới/Sửa/Xóa
- **Nhân viên**: 
  - Thấy banner "Chế độ Chỉ xem"
  - Không thấy nút Thêm/Sửa/Xóa
  - Hiển thị "Chỉ xem" trong card món ăn

### ✅ Trang Kho nguyên liệu (`#!/inventory`)
- **Tất cả** được xem dữ liệu
- **Quản lý**: Thấy nút Thêm/Sửa/Xóa
- **Nhân viên**: 
  - Thấy banner "Chế độ Chỉ xem"
  - Không thấy nút Thêm/Sửa/Xóa
  - Hiển thị "Chỉ xem" trong cột thao tác

---

## Test nhanh

### Test 1: Nhân viên không vào được trang Nhân viên
```
1. Đăng nhập với tài khoản nhân viên
2. Nhập URL: #!/employees
3. Kết quả: Bị chuyển về Dashboard + Alert
```

### Test 2: Nhân viên chỉ xem được Menu
```
1. Đăng nhập với tài khoản nhân viên
2. Vào trang Menu
3. Kết quả: Thấy banner cảnh báo, không thấy nút thêm/sửa/xóa
```

### Test 3: Nhân viên chỉ xem được Kho
```
1. Đăng nhập với tài khoản nhân viên
2. Vào trang Kho
3. Kết quả: Thấy banner cảnh báo, không thấy nút thêm/sửa/xóa
```

### Test 4: Quản lý toàn quyền
```
1. Đăng nhập với tài khoản Quản lý
2. Vào mọi trang
3. Kết quả: Thấy đầy đủ menu và nút chức năng
```

---

## Troubleshooting

### ❓ Không thấy menu "Nhân viên"
→ Bạn không phải Quản lý. Đây là tính năng, không phải lỗi.

### ❓ Không thấy nút Thêm/Sửa/Xóa trong Menu hoặc Kho
→ Bạn không phải Quản lý. Bạn chỉ có quyền xem.

### ❓ Thử thêm món ăn hoặc nguyên liệu nhưng báo lỗi
→ System đã chặn. Chỉ Quản lý mới được thêm/sửa/xóa.

---

## 📚 Tài liệu chi tiết

Xem file `ROLE_PERMISSIONS.md` để biết thêm chi tiết kỹ thuật.
