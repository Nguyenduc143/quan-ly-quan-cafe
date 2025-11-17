# 🔐 Hệ thống Phân quyền - Coffee Shop BOH

## Tổng quan

Hệ thống phân quyền đã được triển khai để kiểm soát quyền truy cập vào các trang và chức năng dựa trên vai trò (role) của người dùng.

---

## 📋 Danh sách Vai trò (Roles)

Hệ thống hỗ trợ 4 vai trò chính:

| Mã | Vai trò | Mô tả |
|----|---------|-------|
| 1 | **Quản lý** | Toàn quyền quản lý hệ thống |
| 2 | **Thu ngân** | Nhân viên thu ngân |
| 3 | **Pha chế** | Nhân viên pha chế |
| 4 | **Phục vụ** | Nhân viên phục vụ |

---

## 🔒 Quy tắc Phân quyền

### **1. Trang Nhân viên (`#!/employees`)**

**✅ Quyền truy cập:**
- ✔️ **Quản lý**: Toàn quyền (Xem, Thêm, Sửa, Xóa)
- ❌ **Tất cả các vai trò khác**: KHÔNG có quyền truy cập

**🛡️ Bảo vệ:**
- Routing guard trong `ng-app.js` ngăn truy cập trực tiếp
- Menu "Nhân viên" bị ẩn khỏi sidebar cho người dùng không phải Quản lý
- Hiển thị thông báo nếu truy cập trái phép: *"⚠️ Bạn không có quyền truy cập trang này! Chỉ Quản lý mới có quyền truy cập."*

---

### **2. Trang Menu (`#!/menu`)**

**👁️ Quyền xem:**
- ✔️ **TẤT CẢ vai trò**: Có quyền xem menu

**✏️ Quyền chỉnh sửa:**
- ✔️ **Quản lý**: Có quyền Thêm, Sửa, Xóa món ăn
- ❌ **Tất cả các vai trò khác**: CHỈ XEM (Read-only)

**🎯 Chi tiết phân quyền:**

| Chức năng | Quản lý | Nhân viên |
|-----------|---------|-----------|
| Xem danh sách món ăn | ✅ | ✅ |
| Tìm kiếm, lọc theo danh mục | ✅ | ✅ |
| Thêm món mới | ✅ | ❌ |
| Sửa thông tin món | ✅ | ❌ |
| Xóa món | ✅ | ❌ |

**🛡️ Bảo vệ:**
- Hiển thị banner cảnh báo cho người dùng không phải Quản lý
- Nút "Thêm món mới", "Sửa", "Xóa" bị ẩn với `ng-if="vm.canEdit"`
- Hiển thị "Chỉ xem" trong card món ăn cho nhân viên
- Backend validation trong controller functions

---

### **3. Trang Kho nguyên liệu (`#!/inventory`)**

**👁️ Quyền xem:**
- ✔️ **TẤT CẢ vai trò**: Có quyền xem dữ liệu

**✏️ Quyền chỉnh sửa:**
- ✔️ **Quản lý**: Có quyền Thêm, Sửa, Xóa
- ❌ **Tất cả các vai trò khác**: CHỈ XEM (Read-only)

**🎯 Chi tiết phân quyền theo chức năng:**

#### **Tab: Nguyên liệu**
| Chức năng | Quản lý | Nhân viên |
|-----------|---------|-----------|
| Xem danh sách | ✅ | ✅ |
| Tìm kiếm, lọc | ✅ | ✅ |
| Thêm nguyên liệu mới | ✅ | ❌ |
| Sửa thông tin | ✅ | ❌ |
| Xóa nguyên liệu | ✅ | ❌ |

#### **Tab: Nhà cung cấp**
| Chức năng | Quản lý | Nhân viên |
|-----------|---------|-----------|
| Xem danh sách | ✅ | ✅ |
| Tìm kiếm | ✅ | ✅ |
| Thêm nhà cung cấp | ✅ | ❌ |
| Sửa thông tin | ✅ | ❌ |
| Xóa nhà cung cấp | ✅ | ❌ |

#### **Tab: Hóa đơn nhập**
| Chức năng | Quản lý | Nhân viên |
|-----------|---------|-----------|
| Xem danh sách | ✅ | ✅ |
| Xem chi tiết hóa đơn | ✅ | ✅ |
| Tạo hóa đơn nhập | ✅ | ❌ |
| Xóa hóa đơn | ✅ | ❌ |

**🛡️ Bảo vệ:**
- Hiển thị banner cảnh báo cho người dùng không phải Quản lý
- Nút "Thêm", "Sửa", "Xóa" bị ẩn với `ng-if="vm.canEdit"`
- Hiển thị "Chỉ xem" trong cột thao tác cho nhân viên
- Backend validation trong controller functions

---

## 🔧 Cài đặt Kỹ thuật

### **1. AuthService (`js/services/AuthService.js`)**

Các functions hỗ trợ phân quyền:

```javascript
// Kiểm tra vai trò cụ thể
hasRole(roleName)

// Kiểm tra nếu là Quản lý
isManager()

// Kiểm tra quyền chỉnh sửa (Manager only)
canEdit()
```

**Ví dụ sử dụng:**
```javascript
if (AuthService.isManager()) {
    // Code chỉ Quản lý mới thực hiện
}

if (AuthService.canEdit()) {
    // Cho phép thêm/sửa/xóa
}
```

---

### **2. Routing Protection (`js/ng-app.js`)**

**Route configuration:**
```javascript
.when('/employees', {
    templateUrl: 'views/employees.html',
    controller: 'EmployeeController',
    controllerAs: 'vm',
    requireAuth: true,
    requireRole: 'Quản lý'  // ⬅️ Chỉ định vai trò
})
```

**Route Guard:**
```javascript
$rootScope.$on('$routeChangeStart', function(event, next, current) {
    // Kiểm tra authentication
    if (next.requireAuth && !AuthService.isAuthenticated()) {
        event.preventDefault();
        $location.path('/login');
        return;
    }

    // Kiểm tra role requirement
    if (next.requireRole && !AuthService.hasRole(next.requireRole)) {
        event.preventDefault();
        alert('⚠️ Bạn không có quyền truy cập!');
        $location.path('/dashboard');
        return;
    }
});
```

---

### **3. Controller Protection**

**MenuController (`js/controllers/MenuController.js`):**

```javascript
// Initialize
vm.canEdit = AuthService.canEdit();
vm.isManager = AuthService.isManager();

// Function protection
function saveProduct() {
    if (!vm.canEdit) {
        NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
        return;
    }
    // ... rest of code
}
```

**InventoryController (`js/controllers/InventoryController.js`):**

```javascript
// Initialize
vm.canEdit = AuthService.canEdit();
vm.isManager = AuthService.isManager();

// Function protection
function saveMaterial() {
    if (!vm.canEdit) {
        NotificationService.error('⚠️ Bạn không có quyền thực hiện thao tác này!');
        return;
    }
    // ... rest of code
}
```

---

### **4. View Protection**

**Ẩn nút thao tác trong HTML:**

```html
<!-- Chỉ hiện nút Thêm cho Quản lý -->
<button ng-if="vm.canEdit" ng-click="vm.openMaterialModal()">
    <i class="fas fa-plus"></i>
    Thêm nguyên liệu
</button>

<!-- Nút Sửa/Xóa -->
<button ng-if="vm.canEdit" ng-click="vm.editMaterial(material)">
    <i class="fas fa-edit"></i>
</button>

<button ng-if="vm.canEdit" ng-click="vm.deleteMaterial(material.id)">
    <i class="fas fa-trash"></i>
</button>

<!-- Hiển thị "Chỉ xem" cho nhân viên -->
<span ng-if="!vm.canEdit" style="color: #6c757d; font-style: italic;">
    Chỉ xem
</span>
```

**Ẩn menu trong sidebar:**

```html
<!-- Chỉ hiện menu Nhân viên cho Quản lý -->
<a href="#!/employees" class="menu-item" ng-if="currentUser.role === 'Quản lý'">
    <i class="fas fa-users"></i>
    <span>Nhân viên</span>
</a>
```

---

## 🎨 UI/UX Features

### **Alert Banner cho chế độ Chỉ xem**

Trong trang Inventory, người dùng không phải Quản lý sẽ thấy banner:

```html
<div ng-if="!vm.canEdit" style="background: linear-gradient(...)">
    <i class="fas fa-info-circle"></i>
    <h4>👁️ Chế độ Chỉ xem</h4>
    <p>
        Bạn đang xem dữ liệu ở chế độ <strong>Chỉ đọc</strong>. 
        Chỉ <strong>Quản lý</strong> mới có quyền thêm, sửa hoặc xóa dữ liệu.
    </p>
</div>
```

---

## 📊 Ma trận Quyền truy cập

| Trang / Chức năng | Quản lý | Thu ngân | Pha chế | Phục vụ |
|-------------------|---------|----------|---------|---------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Menu (Xem)** | ✅ | ✅ | ✅ | ✅ |
| **Menu (Thêm/Sửa/Xóa)** | ✅ | ❌ | ❌ | ❌ |
| **Orders** | ✅ | ✅ | ✅ | ✅ |
| **Tables** | ✅ | ✅ | ✅ | ✅ |
| **Inventory (Xem)** | ✅ | ✅ | ✅ | ✅ |
| **Inventory (Thêm/Sửa/Xóa)** | ✅ | ❌ | ❌ | ❌ |
| **Employees (Xem)** | ✅ | ❌ | ❌ | ❌ |
| **Employees (Thêm/Sửa/Xóa)** | ✅ | ❌ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅ | ✅ |

---

## 🧪 Testing Scenarios

### **Test Case 1: Nhân viên cố truy cập trang Employees**
1. Đăng nhập với tài khoản nhân viên (không phải Quản lý)
2. Thử truy cập `#!/employees` trực tiếp
3. **Kết quả mong đợi**: Bị chuyển về Dashboard với thông báo lỗi

### **Test Case 2: Nhân viên xem trang Menu**
1. Đăng nhập với tài khoản nhân viên
2. Truy cập `#!/menu`
3. **Kết quả mong đợi**: 
   - Thấy banner "Chế độ Chỉ xem"
   - Không thấy nút "Thêm món mới", "Sửa", "Xóa"
   - Thấy text "Chỉ xem" trong card món ăn

### **Test Case 3: Nhân viên xem trang Inventory**
1. Đăng nhập với tài khoản nhân viên
2. Truy cập `#!/inventory`
3. **Kết quả mong đợi**: 
   - Thấy banner "Chế độ Chỉ xem"
   - Không thấy nút "Thêm", "Sửa", "Xóa"
   - Thấy text "Chỉ xem" trong cột thao tác

### **Test Case 4: Nhân viên cố gắng thêm món ăn**
1. Nhân viên mở Developer Console
2. Thử gọi `vm.openProductModal()` từ console
3. **Kết quả mong đợi**: Hiển thị error "⚠️ Bạn không có quyền thực hiện thao tác này!"

### **Test Case 5: Nhân viên cố gắng thêm nguyên liệu**
1. Nhân viên mở Developer Console
2. Thử gọi `vm.openMaterialModal()` từ console
3. **Kết quả mong đợi**: Hiển thị error "⚠️ Bạn không có quyền thực hiện thao tác này!"

### **Test Case 6: Quản lý truy cập đầy đủ**
1. Đăng nhập với tài khoản Quản lý
2. Truy cập tất cả trang
3. **Kết quả mong đợi**: 
   - Thấy menu "Nhân viên" trong sidebar
   - Thấy tất cả nút "Thêm", "Sửa", "Xóa" trong Menu và Inventory
   - Có thể thực hiện mọi thao tác

---

## 🔒 Security Best Practices

### ✅ Đã triển khai:
- [x] Frontend routing protection
- [x] Controller-level permission checks
- [x] UI element hiding based on roles
- [x] User-friendly permission denial messages
- [x] Role-based menu visibility

### ⚠️ Lưu ý quan trọng:
> **Frontend security chỉ là lớp bảo vệ đầu tiên!**
> 
> Backend **PHẢI** validate quyền cho mọi API request:
> - Kiểm tra JWT token
> - Validate user role từ token
> - Reject unauthorized requests với HTTP 403

### 🔐 Backend Requirements:
```csharp
// Example: API endpoint protection
[Authorize(Roles = "Quản lý")]
[HttpPost("api/Inventory")]
public IActionResult AddMaterial([FromBody] MaterialModel model)
{
    // ... implementation
}
```

---

## 📝 Changelog

### Version 1.1 (Current)
- ✅ Triển khai role-based access control
- ✅ Trang Employees: chỉ Quản lý
- ✅ Trang Menu: chỉ Quản lý được thêm/sửa/xóa món ăn
- ✅ Trang Inventory: chỉ Quản lý được thêm/sửa/xóa
- ✅ Ẩn menu items theo vai trò
- ✅ UI indicators cho chế độ read-only
- ✅ Controller-level permission validation

---

## 🚀 Mở rộng trong tương lai

Có thể bổ sung thêm các quyền:
- Thu ngân: Chỉ được quản lý Orders và Tables
- Pha chế: Chỉ được xem Menu và Orders của mình
- Phục vụ: Chỉ được tạo Orders cho bàn
- Báo cáo: Chỉ Quản lý xem được báo cáo tài chính

---

## 📞 Support

Nếu có vấn đề về phân quyền, kiểm tra:
1. User role trong `localStorage.currentUser`
2. Token validity trong `localStorage.authToken`
3. Console errors trong browser DevTools
4. Backend API response codes

---

**✅ Hệ thống phân quyền đã sẵn sàng sử dụng!**
