# 🧪 TEST AUTHENTICATION - FRONTEND

## ✅ ĐÃ CẬP NHẬT

Frontend đã được cập nhật để tương thích với backend mới:

### **Files đã sửa:**
1. ✅ `js/services/AuthService.js` - Improved error handling & logging
2. ✅ `js/controllers/AuthController.js` - Better UX & security

---

## 🎯 TÍNH NĂNG MỚI

### **1. Better Error Messages**
```javascript
// ❌ Trước:
"Đăng nhập thất bại"

// ✅ Bây giờ:
"🔌 Không thể kết nối đến server. Vui lòng kiểm tra:
 1. Backend đang chạy (port 5092)
 2. Gateway đang chạy (port 5000)
 3. Kiểm tra CORS configuration"

"🔒 Tên đăng nhập hoặc mật khẩu không đúng"
"⚠️ Lỗi server. Vui lòng liên hệ quản trị viên."
```

### **2. Enhanced Logging**
```javascript
console.log('🔐 Attempting login with username:', username);
console.log('✅ Login successful:', user);
console.log('✅ Token received:', token.substring(0, 20) + '...');
console.error('❌ Login failed:', error);
```

### **3. Security Improvements**
- ✅ Clear password from memory after login (success or fail)
- ✅ Trim whitespace from username
- ✅ Token stored securely in localStorage
- ✅ Auto clear auth data on logout

### **4. Better Response Handling**
```javascript
// Hỗ trợ nhiều format từ backend:
{
  "success": true,
  "token": "eyJhbGc...",
  "idNhanVien": 1,          // hoặc "id"
  "tenDangNhap": "admin",   // hoặc "username"
  "tenNhanVien": "Admin",   // hoặc "name"
  "loaiTaikhoan": 1,        // hoặc "loaiTaiKhoan"
  "message": "Đăng nhập thành công"
}
```

---

## 🧪 HƯỚNG DẪN TEST

### **Bước 1: Đảm bảo Backend đang chạy**

```bash
# Terminal 1 - Backend API Admin
cd d:\PTPM_DV\QuanLyQuanCafe\Project_APIQuanlyCafe\QuanlyCafe.API.Admin
dotnet run

# Output mong đợi:
# Now listening on: http://localhost:5092

# Terminal 2 - Ocelot Gateway
cd d:\PTPM_DV\QuanLyQuanCafe\Project_APIQuanlyCafe\QuanlyCafe.API.Gateway
dotnet run

# Output mong đợi:
# Now listening on: http://localhost:5000
```

### **Bước 2: Mở Frontend**

```bash
# Mở trong browser:
http://127.0.0.1:5503
# hoặc
http://localhost:5503
```

### **Bước 3: Mở Developer Console**

Nhấn `F12` để mở DevTools và chọn tab **Console**

---

## 📋 TEST CASES

### **Test Case 1: Đăng nhập thành công với admin**

**Input:**
- Username: `admin`
- Password: `admin123`

**Expected Output:**

**Console logs:**
```
🔐 Attempting login with username: admin
Attempting login to: http://localhost:5000/admin/api/Authentication/login
Login data: {tenDangNhap: "admin", matKhau: "admin123"}
✅ Login response: {data: {success: true, token: "eyJ...", ...}}
✅ User mapped: {id: 1, username: "admin", name: "Admin", role: "Quản lý"}
✅ Token received: eyJhbGciOiJIUzI1NiIs...
✅ Login successful: {id: 1, username: "admin", ...}
➡️ Redirecting to dashboard...
```

**UI:**
- ✅ Toast notification: "Đăng nhập thành công!"
- ✅ Redirect to `/dashboard`
- ✅ Username cleared if "Remember me" unchecked
- ✅ Password field cleared

---

### **Test Case 2: Đăng nhập sai mật khẩu**

**Input:**
- Username: `admin`
- Password: `wrongpassword`

**Expected Output:**

**Console logs:**
```
🔐 Attempting login with username: admin
❌ API login failed: {status: 401, statusText: "Unauthorized", ...}
Error details: {status: 401, statusText: "Unauthorized", data: {success: false, message: "..."}}
❌ Login failed: 🔒 Tên đăng nhập hoặc mật khẩu không đúng
```

**UI:**
- ✅ Toast notification (error, red): "🔒 Tên đăng nhập hoặc mật khẩu không đúng"
- ✅ Stay on login page
- ✅ Password field cleared (security)
- ✅ Username retained

---

### **Test Case 3: Backend không chạy**

**Precondition:** Stop backend services

**Input:**
- Username: `admin`
- Password: `admin123`

**Expected Output:**

**Console logs:**
```
🔐 Attempting login with username: admin
❌ API login failed: {status: -1, statusText: "", data: null}
❌ Login failed: 🔌 Không thể kết nối đến server. Vui lòng kiểm tra:
1. Backend đang chạy (port 5092)
2. Gateway đang chạy (port 5000)
3. Kiểm tra CORS configuration
```

**UI:**
- ✅ Toast notification (error, 5s timeout): "🔌 Không thể kết nối đến server..."
- ✅ Clear instructions in notification

---

### **Test Case 4: Username rỗng**

**Input:**
- Username: ` ` (empty or spaces)
- Password: `admin123`

**Expected Output:**
- ✅ Toast notification (error): "Vui lòng nhập tên đăng nhập và mật khẩu"
- ✅ No API call made
- ✅ Stay on login page

---

### **Test Case 5: Remember me checkbox**

**Input:**
- Username: `admin`
- Password: `admin123`
- Remember me: ✅ Checked

**Expected Output:**
- ✅ Login successful
- ✅ localStorage contains `rememberedUsername: "admin"`
- ✅ On page reload, username field pre-filled with "admin"

**Test again with unchecked:**
- ✅ localStorage `rememberedUsername` removed
- ✅ On page reload, username field empty

---

### **Test Case 6: Server error (500)**

**Precondition:** Backend có lỗi (simulate bằng cách stop database)

**Expected Output:**

**Console logs:**
```
❌ API login failed: {status: 500, ...}
❌ Login failed: ⚠️ Lỗi server. Vui lòng liên hệ quản trị viên.
```

**UI:**
- ✅ Toast notification (error): "⚠️ Lỗi server. Vui lòng liên hệ quản trị viên."

---

### **Test Case 7: Token được lưu đúng**

**After successful login:**

**Check localStorage:**
```javascript
// In browser console:
localStorage.getItem('authToken')
// Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

localStorage.getItem('currentUser')
// Output: '{"id":1,"username":"admin","name":"Admin","role":"Quản lý"}'
```

**Check token is sent in API calls:**
```javascript
// In Network tab, check any API request:
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

### **Test Case 8: Logout clears data**

**Steps:**
1. Login successfully
2. Go to dashboard
3. Click logout button

**Expected Output:**
- ✅ Toast notification: "Đang đăng xuất..."
- ✅ Redirect to `/login`
- ✅ localStorage cleared:
  - `authToken` removed
  - `currentUser` removed
- ✅ Cannot access protected routes

---

### **Test Case 9: Auto redirect if authenticated**

**Steps:**
1. Login successfully → go to dashboard
2. Manually navigate to `#!/login`

**Expected Output:**
- ✅ Immediately redirect to `#!/dashboard`
- ✅ No login form shown

---

### **Test Case 10: Protected routes require auth**

**Steps:**
1. Clear localStorage (logout)
2. Try to access `#!/dashboard`

**Expected Output:**
- ✅ Redirect to `#!/login`
- ✅ Show notification: "Vui lòng đăng nhập"

---

## 🔍 DEBUGGING TIPS

### **Check if backend is running:**
```bash
# Open in browser:
http://localhost:5092/swagger

# Should see Swagger UI
```

### **Check if gateway is running:**
```bash
# Test endpoint:
curl http://localhost:5000/admin/api/Authentication/login

# Should NOT return 404
```

### **Check CORS:**
```javascript
// In browser console:
fetch('http://localhost:5000/admin/api/Authentication/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({tenDangNhap: 'admin', matKhau: 'admin123'})
})
.then(r => r.json())
.then(console.log)

// If CORS error → Backend needs CORS config
```

### **Verify token validity:**
```javascript
// Copy token from localStorage
var token = localStorage.getItem('authToken');

// Decode JWT (use jwt.io)
// Check:
// - exp (expiration) not expired
// - iss (issuer) matches backend config
// - aud (audience) matches backend config
```

---

## ✅ CHECKLIST

### **Before Testing:**
- [ ] Backend Admin API running on port 5092
- [ ] Ocelot Gateway running on port 5000
- [ ] Database connection working
- [ ] Frontend served (Live Server on port 5503)
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible for logs

### **After Testing:**
- [ ] Login với admin thành công
- [ ] Login sai password hiển thị lỗi đúng
- [ ] Backend down hiển thị message hữu ích
- [ ] Token được lưu vào localStorage
- [ ] Token được gửi trong API requests
- [ ] Logout clear data thành công
- [ ] Protected routes yêu cầu authentication
- [ ] Remember me hoạt động
- [ ] Password được clear sau login
- [ ] Console logs rõ ràng, có emoji

---

## 🎯 KẾT QUẢ MONG ĐỢI

### **✅ Thành công khi:**
- Login form validates input
- API calls có proper headers (Authorization)
- Error messages rõ ràng và hữu ích
- Token được lưu và sử dụng đúng
- Logout clears all auth data
- Protected routes hoạt động đúng
- Console logs giúp debug dễ dàng
- UX tốt với loading states và notifications

### **❌ Thất bại khi:**
- Token không được lưu
- API calls thiếu Authorization header
- Error messages không rõ ràng
- Password không được clear (security risk)
- Logout không clear data
- Protected routes accessible without auth
- Console đầy errors không cần thiết

---

## 📝 NOTES

### **Password Hashing**
Backend giờ đã hash password với BCrypt. Frontend vẫn gửi plain text password (đúng!), backend sẽ verify hash.

### **Token Expiration**
Token expire sau 60 phút (config trong backend). Frontend nên handle token refresh hoặc re-login.

### **Role-Based Access**
Frontend lưu role trong user object. Các controller khác có thể dùng:
```javascript
var currentUser = AuthService.getCurrentUser();
if (currentUser.role === 'Quản lý') {
  // Show admin features
}
```

---

**Người tạo:** GitHub Copilot  
**Ngày:** 16/11/2025  
**Status:** ✅ Ready for testing
