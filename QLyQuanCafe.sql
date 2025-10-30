
﻿-- Tạo database
CREATE DATABASE QLyQuanCafe
GO

USE QLyQuanCafe
GO

-- 1. BẢNG NHÂN VIÊN
CREATE TABLE NhanVien
(
	id INT IDENTITY PRIMARY KEY,
	hoTen NVARCHAR(100) NOT NULL,
	ngaySinh DATE,
	gioiTinh NVARCHAR(10),
	sdt NVARCHAR(15),
	diaChi NVARCHAR(255),
	Luong INT,
	ChucVu NVARCHAR(50)
)

-- 2. BẢNG TÀI KHOẢN
CREATE TABLE TaiKhoan
(
	tenDangNhap NVARCHAR(100) NOT NULL PRIMARY KEY,
	tenHienThi NVARCHAR(100) NOT NULL DEFAULT N'Admin',
	matKhau NVARCHAR(1000) NOT NULL DEFAULT 0,
	loaiTaiKhoan INT NOT NULL DEFAULT 0, -- 1: admin || 0: nhân viên
	idNhanVien INT

	FOREIGN KEY (idNhanVien) REFERENCES NhanVien(id)
)

-- 3. BẢNG BÀN
CREATE TABLE Ban
(
	id INT IDENTITY PRIMARY KEY,
	tenBan NVARCHAR(100) NOT NULL DEFAULT N'Bàn chưa có tên',
	trangThai NVARCHAR(100) DEFAULT N'Trống' -- Trống || Có người
)

-- 4. DANH MỤC MÓN ĂN
CREATE TABLE DanhMucMonAn
(
	id INT IDENTITY PRIMARY KEY,
	tenDanhMuc NVARCHAR(100) NOT NULL DEFAULT N'Chưa đặt tên'
)

-- 5. MÓN ĂN
CREATE TABLE MonAn
(
	id INT IDENTITY PRIMARY KEY,
	tenMonAn NVARCHAR(100) NOT NULL DEFAULT N'Chưa đặt tên',
	idDanhMuc INT NOT NULL,
	giaTien FLOAT NOT NULL,

	FOREIGN KEY (idDanhMuc) REFERENCES DanhMucMonAn(id)
)

-- 6. HÓA ĐƠN BÁN
CREATE TABLE HoaDonBan
(
	id INT IDENTITY PRIMARY KEY,
	thoiDiemVao DATETIME NOT NULL DEFAULT GETDATE(),
	thoiDiemRa DATETIME,
	idBanAn INT NOT NULL,
	trangThaiHD INT NOT NULL DEFAULT 0, -- 1: Đã thanh toán || 0: Chưa thanh toán
	idNhanVien INT,

	FOREIGN KEY (idBanAn) REFERENCES Ban(id),
	FOREIGN KEY (idNhanVien) REFERENCES NhanVien(id)
)

-- 7. CHI TIẾT HÓA ĐƠN BÁN
CREATE TABLE ChiTietHoaDonBan
(
	id INT IDENTITY PRIMARY KEY,
	idHoaDonBan INT NOT NULL,
	idMonAn INT NOT NULL,
	soLuong INT NOT NULL DEFAULT 0,

	FOREIGN KEY (idHoaDonBan) REFERENCES HoaDonBan(id), -- Đã sửa lại tên bảng
	FOREIGN KEY (idMonAn) REFERENCES MonAn(id)
)

-- 8. NHÀ CUNG CẤP
CREATE TABLE NhaCungCap
(
	id INT IDENTITY PRIMARY KEY,
	tenNhaCungCap NVARCHAR(100) NOT NULL,
	diaChi NVARCHAR(255),
	sdt NVARCHAR(15),
	email NVARCHAR(100)
)

-- 9 KHO NGUYÊN LIỆU
CREATE TABLE KhoNguyenLieu
(
	id INT IDENTITY PRIMARY KEY,
	tenNguyenLieu NVARCHAR(100) NOT NULL,
	donViTinh NVARCHAR(50),
	soLuongTon FLOAT NOT NULL DEFAULT 0,
	ghiChu NVARCHAR(255)
)
CREATE TABLE CongThucMonAn
(
    idMonAn INT NOT NULL,
    idNguyenLieu INT NOT NULL,
    soLuong FLOAT NOT NULL, -- Số lượng nguyên liệu cần cho 1 món (ví dụ: 0.1 kg trà đen)
    donViTinh NVARCHAR(50) NOT NULL,
    PRIMARY KEY (idMonAn, idNguyenLieu),
    FOREIGN KEY (idMonAn) REFERENCES MonAn(id),
    FOREIGN KEY (idNguyenLieu) REFERENCES KhoNguyenLieu(id)
);
-- 10. HÓA ĐƠN NHẬP
CREATE TABLE HoaDonNhap
(
	id INT IDENTITY PRIMARY KEY,
	idNhanVien INT NOT NULL,
	idNhaCungCap INT NOT NULL,
	ngayNhap DATETIME NOT NULL DEFAULT GETDATE(),
	tongTien FLOAT NOT NULL DEFAULT 0,

	FOREIGN KEY (idNhanVien) REFERENCES NhanVien(id),
	FOREIGN KEY (idNhaCungCap) REFERENCES NhaCungCap(id)
)

-- 11. CHI TIẾT HÓA ĐƠN NHẬP
CREATE TABLE ChiTietHoaDonNhap
(
	id INT IDENTITY PRIMARY KEY,
	idHoaDonNhap INT NOT NULL,
	idNguyenLieu INT NOT NULL, -- Liên kết với KhoNguyenLieu
	donViTinh NVARCHAR(50),
	soLuong INT NOT NULL DEFAULT 0,
	donGia FLOAT NOT NULL DEFAULT 0,

	FOREIGN KEY (idHoaDonNhap) REFERENCES HoaDonNhap(id),
	FOREIGN KEY (idNguyenLieu) REFERENCES KhoNguyenLieu(id) 
)

-- 12. BÁO CÁO DOANH THU
CREATE TABLE BaoCaoDoanhThu
(
    id INT IDENTITY PRIMARY KEY,
    tuNgay DATE NOT NULL,
    denNgay DATE NOT NULL,
    tongSoHoaDonBan INT NOT NULL DEFAULT 0,
    tongSoHoaDonNhap INT NOT NULL DEFAULT 0,
    tongDoanhThuBan FLOAT NOT NULL DEFAULT 0,
    tongChiPhiNhap FLOAT NOT NULL DEFAULT 0,
    tongDoanhThu FLOAT NOT NULL DEFAULT 0,
    idNhanVien INT,
    ngayTao DATETIME NOT NULL DEFAULT GETDATE(),
    ghiChu NVARCHAR(255),
    CONSTRAINT FK_BaoCaoDoanhThu_NhanVien FOREIGN KEY (idNhanVien) REFERENCES NhanVien(id),
    CONSTRAINT CHK_TuNgay_DenNgay CHECK (tuNgay <= denNgay)
);

SELECT * FROM NhanVien;
SELECT * FROM TaiKhoan;
SELECT * FROM Ban;
SELECT * FROM DanhMucMonAn;
SELECT * FROM MonAn;
SELECT * FROM CongThucMonAn;
SELECT * FROM HoaDonBan;
SELECT * FROM ChiTietHoaDonBan;
SELECT * FROM NhaCungCap;
SELECT * FROM KhoNguyenLieu;
SELECT * FROM HoaDonNhap;
SELECT * FROM ChiTietHoaDonNhap;
SELECT * FROM BaoCaoDoanhThu;

INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu)
VALUES
(N'Nguyễn Văn Đức', '2005-03-14', N'Nam', '0967688908', N'Khoái Châu, Hưng Yên', 10000000, N'Quản lý'),
(N'Bùi Trí Dũng', '2005-09-25', N'Nam', '0867438232', N'Mỹ Hào, Hưng Yên', 8000000, N'Thu ngân'),
(N'Nguyễn Đức Huy', '2005-01-25', N'Nam', '0336113905', N'Khoái Châu, Hưng Yên', 8000000, N'Phục vụ'),
(N'Huy Đức Dũng', '2005-01-01', N'Nam', '0123456789', N'Hưng Yên', 8000000, N'Pha chế');

INSERT INTO TaiKhoan (tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien)
VALUES
(N'admin', N'NguyenVanDuc', N'admin123', 1, 1),
(N'dung', N'BuiTriDung', N'dung123', 0, 2),
(N'huy', N'NguyenDucHuy', N'123', 0, 3),
(N'phache', N'phache', N'staff123', 0, 4);

INSERT INTO Ban (tenBan, trangThai)
VALUES
(N'Bàn 1', N'Trống'),
(N'Bàn 2', N'Trống'),
(N'Bàn 3', N'Trống'),
(N'Bàn 4', N'Trống');

INSERT INTO DanhMucMonAn (tenDanhMuc)
VALUES
(N'Cà phê truyền thống'),
(N'Cà phê máy'),
(N'Cà phê đá xay'),
(N'Trà và sinh tố'),
(N'Đồ ăn nhẹ'),
(N'Đồ uống đặc biệt'),
(N'Sữa chua và đá bào'),
(N'Nước đóng chai');

INSERT INTO MonAn (tenMonAn, idDanhMuc, giaTien)
VALUES
-- 1️ Cà phê truyền thống
(N'Cà phê sữa đá', 1, 25000),
(N'Cà phê đen đá', 1, 20000),
(N'Bạc xỉu', 1, 25000),
(N'Cà phê sữa nóng', 1, 27000),
(N'Cà phê đen nóng', 1, 22000),

-- 2️ Cà phê máy
(N'Espresso', 2, 35000),
(N'Cappuccino', 2, 40000),
(N'Latte', 2, 42000),
(N'Mocha', 2, 45000),
(N'Americano', 2, 38000),

-- 3️ Cà phê đá xay
(N'Caramel đá xay', 3, 45000),
(N'Mocha đá xay', 3, 48000),
(N'Cookie đá xay', 3, 47000),
(N'Chocolate đá xay', 3, 46000),

-- 4️ Trà và sinh tố
(N'Trà đào cam sả', 4, 40000),
(N'Trà vải', 4, 38000),
(N'Trà sữa trân châu', 4, 42000),
(N'Sinh tố bơ', 4, 45000),
(N'Sinh tố xoài', 4, 45000),
(N'Nước ép cam', 4, 40000),

-- 5️ Đồ ăn nhẹ
(N'Bánh flan', 5, 20000),
(N'Sandwich trứng', 5, 30000),
(N'Bánh mì bơ tỏi', 5, 25000),
(N'Bánh cookie hạnh nhân', 5, 28000),
(N'Tiramisu mini', 5, 35000),

-- 6️Đồ uống đặc biệt
(N'Cà phê muối', 6, 42000),
(N'Matcha cream cheese', 6, 45000),
(N'Cacao kem sữa', 6, 43000),

-- 7️ Sữa chua & đá bào
(N'Sữa chua nếp cẩm', 7, 30000),
(N'Sữa chua trái cây', 7, 32000),
(N'Đá bào trái cây tổng hợp', 7, 35000),

-- 8️ Nước đóng chai
(N'Nước suối Aquafina', 8, 15000),
(N'Nước suối Lavie', 8, 15000),
(N'Coca-Cola', 8, 18000),
(N'Pepsi', 8, 18000),
(N'Sprite', 8, 18000);

INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email)
VALUES
(N'Công ty TNHH Coffee Bean Việt Nam', N'12 Nguyễn Thị Minh Khai, Q1, TP.HCM', N'0909123456', N'info@coffeebean.vn'),
(N'Công ty CP Sữa Việt', N'25 Lý Thường Kiệt, Q10, TP.HCM', N'0909345678', N'contact@sua.vn'),
(N'Nhà phân phối Bánh Ngọt Ánh Dương', N'88 Hai Bà Trưng, Hà Nội', N'0912233445', N'sales@anhduongbakery.vn');

INSERT INTO KhoNguyenLieu (tenNguyenLieu, donViTinh, soLuongTon, ghiChu)
VALUES
(N'Hạt cà phê Arabica', N'kg', 20, N'Dùng cho cà phê pha máy'),
(N'Hạt cà phê Robusta', N'kg', 30, N'Dùng cho cà phê phin'),
(N'Sữa đặc', N'lít', 10, N'Lon 380g pha chế'),
(N'Sữa tươi', N'lít', 15, N'Sữa thanh trùng'),
(N'Bột cacao', N'kg', 5, N'Dùng cho mocha, cacao sữa'),
(N'Bột matcha', N'kg', 3, N'Dùng cho matcha cream cheese'),
(N'Trà đào', N'gói', 10, N'Pha trà đào cam sả'),
(N'Đường cát', N'kg', 10, N'Pha chế chung'),
(N'Đá viên', N'kg', 100, N'Đá lạnh dùng cho đồ uống'),
(N'Hoa quả tươi', N'kg', 8, N'Dùng cho sinh tố và nước ép');

INSERT INTO CongThucMonAn (idMonAn, idNguyenLieu, soLuong, donViTinh)
VALUES
-- Cà phê sữa đá
(1, 2, 0.02, N'kg'), -- Robusta
(1, 3, 0.05, N'lít'),
(1, 9, 0.2, N'kg'),

-- Espresso
(3, 1, 0.02, N'kg'),
(3, 9, 0.1, N'kg'),

-- Latte
(8, 1, 0.02, N'kg'),
(8, 4, 0.15, N'lít'),

-- Trà đào cam sả
(15, 7, 0.02, N'gói'),
(15, 10, 0.05, N'kg'),

-- Sinh tố bơ
(18, 10, 0.1, N'kg'),
(18, 4, 0.1, N'lít'),
(18, 8, 0.02, N'kg'),

-- Cà phê muối
(26, 2, 0.02, N'kg'),
(26, 3, 0.05, N'lít'),
(26, 9, 0.2, N'kg');

INSERT INTO HoaDonNhap (idNhanVien, idNhaCungCap, ngayNhap, tongTien)
VALUES
(1, 1, GETDATE()-10, 500000),
(1, 2, GETDATE()-7, 350000),
(1, 3, GETDATE()-3, 250000);

INSERT INTO ChiTietHoaDonNhap (idHoaDonNhap, idNguyenLieu, donViTinh, soLuong, donGia)
VALUES
(1, 1, N'kg', 10, 20000),
(1, 2, N'kg', 10, 18000),
(2, 3, N'lít', 5, 30000),
(2, 4, N'lít', 10, 25000),
(3, 5, N'kg', 2, 70000),
(3, 6, N'kg', 1, 90000);

INSERT INTO HoaDonBan (thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien)
VALUES
(GETDATE()-1, GETDATE()-1+0.02, 1, 1, 1),
(GETDATE()-0.5, GETDATE()-0.5+0.03, 2, 1, 1),
(GETDATE(), NULL, 3, 0, 1);

INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong)
VALUES
(1, 1, 2), -- 2 cà phê sữa đá
(1, 15, 1), -- 1 trà đào cam sả
(2, 8, 1),  -- 1 Latte
(2, 18, 1), -- 1 Sinh tố bơ
(3, 3, 1);  -- 1 Espresso (chưa thanh toán)

INSERT INTO BaoCaoDoanhThu (tuNgay, denNgay, tongSoHoaDonBan, tongSoHoaDonNhap, tongDoanhThuBan, tongChiPhiNhap, tongDoanhThu, idNhanVien, ghiChu)
VALUES
('2025-10-01', '2025-10-17', 2, 3, 370000, 1100000, -730000, 1, N'Tháng 10: Lỗ do nhập hàng đầu kỳ');

--Kiểm tra nhanh
SELECT COUNT(*) AS SoMonAn FROM MonAn;
SELECT COUNT(*) AS SoHoaDonBan FROM HoaDonBan;
SELECT COUNT(*) AS SoNhaCungCap FROM NhaCungCap;
SELECT COUNT(*) AS SoNguyenLieu FROM KhoNguyenLieu;
SELECT COUNT(*) AS SoCongThuc FROM CongThucMonAn;

--Proc
-- 1. Check if table name exists
CREATE PROCEDURE sp_CheckTenBanExists
    @TENBAN NVARCHAR(100)
AS
BEGIN
    SELECT COUNT(1) AS Count FROM Ban WHERE TENBAN = @TENBAN;
END
GO

-- 2. Get all tables
CREATE PROCEDURE sp_GetAllBan
AS
BEGIN
    SELECT ID, TENBAN, TRANGTHAI FROM Ban;
END
GO

-- 3. Get tables by status
CREATE PROCEDURE sp_GetBanByTrangThai
    @TRANGTHAI NVARCHAR(100)
AS
BEGIN
    SELECT ID, TENBAN, TRANGTHAI FROM Ban WHERE TRANGTHAI = @TRANGTHAI;
END
GO

-- 4. Get table by ID
CREATE PROCEDURE sp_GetBanById
    @ID INT
AS
BEGIN
    SELECT ID, TENBAN, TRANGTHAI FROM Ban WHERE ID = @ID;
END
GO

-- 5. Insert new table
CREATE PROCEDURE sp_ThemBan
    @TENBAN NVARCHAR(100),
    @TRANGTHAI NVARCHAR(100)
AS
BEGIN
    INSERT INTO Ban (TENBAN, TRANGTHAI) VALUES (@TENBAN, @TRANGTHAI);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 6. Check duplicate name for update
CREATE PROCEDURE sp_CheckTenBanExistsForUpdate
    @TENBAN NVARCHAR(100),
    @ID INT
AS
BEGIN
    SELECT COUNT(1) AS Count FROM Ban WHERE TENBAN = @TENBAN AND ID <> @ID;
END
GO

-- 7. Update table
CREATE PROCEDURE sp_CapNhatBan
    @ID INT,
    @TENBAN NVARCHAR(100),
    @TRANGTHAI NVARCHAR(100)
AS
BEGIN
    UPDATE Ban SET TENBAN = @TENBAN, TRANGTHAI = @TRANGTHAI WHERE ID = @ID;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 8. Update table status
CREATE PROCEDURE sp_CapNhatTrangThaiBan
    @ID INT,
    @TRANGTHAI NVARCHAR(100)
AS
BEGIN
    UPDATE Ban SET TRANGTHAI = @TRANGTHAI WHERE ID = @ID;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 9. Delete table
CREATE PROCEDURE sp_XoaBan
    @ID INT
AS
BEGIN
    DELETE FROM Ban WHERE ID = @ID;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO
-- Product & Category Stored Procedures

-- 1. Check if product name exists
CREATE PROCEDURE sp_CheckProductNameExists
    @tenMonAn NVARCHAR(100),
    @exceptId INT = NULL
AS
BEGIN
    IF @exceptId IS NULL
        SELECT COUNT(1) AS Count FROM MonAn WHERE tenMonAn = @tenMonAn;
    ELSE
        SELECT COUNT(1) AS Count FROM MonAn WHERE tenMonAn = @tenMonAn AND id <> @exceptId;
END
GO

-- 2. Check if category name exists
CREATE PROCEDURE sp_CheckCategorieNameExists
    @tenDanhMuc NVARCHAR(100),
    @exceptId INT = NULL
AS
BEGIN
    IF @exceptId IS NULL
        SELECT COUNT(1) AS Count FROM DanhMucMonAn WHERE tenDanhMuc = @tenDanhMuc;
    ELSE
        SELECT COUNT(1) AS Count FROM DanhMucMonAn WHERE tenDanhMuc = @tenDanhMuc AND id <> @exceptId;
END
GO

-- 3. Get all categories
CREATE PROCEDURE sp_GetAllDanhMuc
AS
BEGIN
    SELECT ID, TENDANHMUC FROM DanhMucMonAn;
END
GO

-- 4. Get all products with categories
CREATE PROCEDURE sp_GetAllMonAn
AS
BEGIN
    SELECT m.ID, m.TENMONAN, m.GIATIEN, d.TENDANHMUC
    FROM MonAn m
    INNER JOIN DanhMucMonAn d ON m.IDDANHMUC = d.ID;
END
GO

-- 5. Get products by category
CREATE PROCEDURE sp_GetMonAnByDanhMuc
    @idDanhMuc INT
AS
BEGIN
    SELECT m.ID, m.TENMONAN, m.GIATIEN, d.TENDANHMUC
    FROM MonAn m
    INNER JOIN DanhMucMonAn d ON m.IDDANHMUC = d.ID
    WHERE m.IDDANHMUC = @idDanhMuc;
END
GO

-- 6. Add new category
CREATE PROCEDURE sp_ThemDanhMuc
    @tenDanhMuc NVARCHAR(100)
AS
BEGIN
    INSERT INTO DanhMucMonAn (tenDanhMuc) VALUES (@tenDanhMuc);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 7. Add new product
CREATE PROCEDURE sp_ThemMonAn
    @tenMonAn NVARCHAR(100),
    @idDanhMuc INT,
    @giaTien FLOAT
AS
BEGIN
    INSERT INTO MonAn (tenMonAn, idDanhMuc, giaTien) VALUES (@tenMonAn, @idDanhMuc, @giaTien);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 8. Update product
CREATE PROCEDURE sp_CapNhatMonAn
    @id INT,
    @tenMonAn NVARCHAR(100),
    @idDanhMuc INT,
    @giaTien FLOAT
AS
BEGIN
    UPDATE MonAn SET tenMonAn = @tenMonAn, idDanhMuc = @idDanhMuc, giaTien = @giaTien WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 9. Update category
CREATE PROCEDURE sp_CapNhatDanhMuc
    @id INT,
    @tenDanhMuc NVARCHAR(100)
AS
BEGIN
    UPDATE DanhMucMonAn SET tenDanhMuc = @tenDanhMuc WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 10. Delete product
CREATE PROCEDURE sp_XoaMonAn
    @id INT
AS
BEGIN
    DELETE FROM MonAn WHERE ID = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Authentication Stored Procedures

-- 1. Check if account exists
CREATE PROCEDURE sp_CheckTaiKhoanExists
    @tenDangNhap NVARCHAR(100)
AS
BEGIN
    SELECT COUNT(1) AS Count FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap;
END
GO

-- 2. Add new account
CREATE PROCEDURE sp_ThemTaiKhoan
    @tenDangNhap NVARCHAR(100),
    @tenHienThi NVARCHAR(200),
    @matKhau NVARCHAR(255),
    @loaiTaiKhoan INT,
    @idNhanVien INT = NULL
AS
BEGIN
    INSERT INTO TaiKhoan (tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien) 
    VALUES (@tenDangNhap, @tenHienThi, @matKhau, @loaiTaiKhoan, @idNhanVien);
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 3. Login authentication
CREATE PROCEDURE sp_DangNhap
    @tenDangNhap NVARCHAR(100),
    @matKhau NVARCHAR(255)
AS
BEGIN
    SELECT tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien 
    FROM TaiKhoan 
    WHERE tenDangNhap = @tenDangNhap AND matKhau = @matKhau;
END
GO

-- 4. Get account by username
CREATE PROCEDURE sp_GetTaiKhoanByTenDangNhap
    @tenDangNhap NVARCHAR(100)
AS
BEGIN
    SELECT tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien 
    FROM TaiKhoan 
    WHERE tenDangNhap = @tenDangNhap;
END
GO

-- 5. Change password
CREATE PROCEDURE sp_DoiMatKhau
    @tenDangNhap NVARCHAR(100),
    @matKhau NVARCHAR(255)
AS
BEGIN
    UPDATE TaiKhoan SET matKhau = @matKhau WHERE tenDangNhap = @tenDangNhap;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 6. Check old password
CREATE PROCEDURE sp_KiemTraMatKhauCu
    @tenDangNhap NVARCHAR(100),
    @matKhau NVARCHAR(255)
AS
BEGIN
    SELECT COUNT(1) AS Count FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap AND matKhau = @matKhau;
END
GO

-- 7. Get all accounts
CREATE PROCEDURE sp_GetAllTaiKhoan
AS
BEGIN
    SELECT tenDangNhap, tenHienThi, loaiTaiKhoan, idNhanVien FROM TaiKhoan;
END
GO

-- Employees Stored Procedures - Updated với cột cụ thể

-- 1. Get all employees
CREATE PROCEDURE sp_GetAllEmployees
AS
BEGIN
    SELECT id, hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu 
    FROM NhanVien;
END
GO

-- 2. Get employee by ID
CREATE PROCEDURE sp_GetEmployeeById
    @id INT
AS
BEGIN
    SELECT id, hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu 
    FROM NhanVien 
    WHERE id = @id;
END
GO

-- 3. Create new employee
CREATE PROCEDURE sp_CreateEmployee
    @hoTen NVARCHAR(255),
    @ngaySinh DATETIME = NULL,
    @gioiTinh NVARCHAR(10) = NULL,
    @sdt NVARCHAR(20) = NULL,
    @diaChi NVARCHAR(500) = NULL,
    @Luong INT = NULL,
    @ChucVu NVARCHAR(100) = NULL
AS
BEGIN
    INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu) 
    VALUES (@hoTen, @ngaySinh, @gioiTinh, @sdt, @diaChi, @Luong, @ChucVu);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 4. Update employee
CREATE PROCEDURE sp_UpdateEmployee
    @id INT,
    @hoTen NVARCHAR(255),
    @ngaySinh DATETIME = NULL,
    @gioiTinh NVARCHAR(10) = NULL,
    @sdt NVARCHAR(20) = NULL,
    @diaChi NVARCHAR(500) = NULL,
    @Luong INT = NULL,
    @ChucVu NVARCHAR(100) = NULL
AS
BEGIN
    UPDATE NhanVien 
    SET hoTen = @hoTen, ngaySinh = @ngaySinh, gioiTinh = @gioiTinh, 
        sdt = @sdt, diaChi = @diaChi, Luong = @Luong, ChucVu = @ChucVu 
    WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 5. Delete employee
CREATE PROCEDURE sp_DeleteEmployee
    @id INT
AS
BEGIN
    DELETE FROM NhanVien WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Inventory Stored Procedures

-- 1. Get all inventory items
CREATE PROCEDURE sp_GetAllInventory
AS
BEGIN
    SELECT id, tenNguyenLieu, donViTinh, soLuongTon, ghiChu 
    FROM KhoNguyenLieu 
    ORDER BY tenNguyenLieu;
END
GO

-- 2. Get inventory item by ID
CREATE PROCEDURE sp_GetInventoryById
    @id INT
AS
BEGIN
    SELECT id, tenNguyenLieu, donViTinh, soLuongTon, ghiChu 
    FROM KhoNguyenLieu 
    WHERE id = @id;
END
GO

-- 3. Create new inventory item
CREATE PROCEDURE sp_CreateInventory
    @tenNguyenLieu NVARCHAR(255),
    @donViTinh NVARCHAR(50) = NULL,
    @soLuongTon FLOAT,
    @ghiChu NVARCHAR(500) = NULL
AS
BEGIN
    INSERT INTO KhoNguyenLieu (tenNguyenLieu, donViTinh, soLuongTon, ghiChu) 
    VALUES (@tenNguyenLieu, @donViTinh, @soLuongTon, @ghiChu);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 4. Update inventory item
CREATE PROCEDURE sp_UpdateInventory
    @id INT,
    @tenNguyenLieu NVARCHAR(255),
    @donViTinh NVARCHAR(50) = NULL,
    @soLuongTon FLOAT,
    @ghiChu NVARCHAR(500) = NULL
AS
BEGIN
    UPDATE KhoNguyenLieu 
    SET tenNguyenLieu = @tenNguyenLieu, donViTinh = @donViTinh, 
        soLuongTon = @soLuongTon, ghiChu = @ghiChu 
    WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 5. Delete inventory item
CREATE PROCEDURE sp_DeleteInventory
    @id INT
AS
BEGIN
    DELETE FROM KhoNguyenLieu WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Invoice Stored Procedures

-- 1. Get paid invoices
CREATE PROCEDURE sp_GetPaidInvoices
AS
BEGIN
    SELECT id, thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien 
    FROM HoaDonBan 
    WHERE trangThaiHD = 1
    ORDER BY thoiDiemVao DESC;
END
GO

-- 2. Get paid invoice by ID
CREATE PROCEDURE sp_GetPaidInvoiceById
    @id INT
AS
BEGIN
    SELECT id, thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien 
    FROM HoaDonBan 
    WHERE id = @id AND trangThaiHD = 1;
END
GO

-- 3. Get print invoice by ID (with table and employee names)
CREATE PROCEDURE sp_GetPrintInvoiceById
    @id INT
AS
BEGIN
    SELECT hd.id, hd.thoiDiemVao, hd.thoiDiemRa, hd.idBanAn, hd.trangThaiHD, hd.idNhanVien,
           b.tenBan as TenBanAn, nv.hoTen as TenNhanVien
    FROM HoaDonBan hd
    LEFT JOIN Ban b ON hd.idBanAn = b.id
    LEFT JOIN NhanVien nv ON hd.idNhanVien = nv.id
    WHERE hd.id = @id AND hd.trangThaiHD = 1;
END
GO

-- 4. Check invoice payment status
CREATE PROCEDURE sp_IsInvoicePaid
    @id INT
AS
BEGIN
    SELECT trangThaiHD FROM HoaDonBan WHERE id = @id;
END
GO

-- 5. Get invoice details (without price)
CREATE PROCEDURE sp_GetInvoiceDetails
    @invoiceId INT
AS
BEGIN
    SELECT ct.id, ct.idHoaDonBan, ct.idMonAn, ct.soLuong,
           ma.tenMonAn
    FROM ChiTietHoaDonBan ct
    INNER JOIN MonAn ma ON ct.idMonAn = ma.id
    WHERE ct.idHoaDonBan = @invoiceId;
END
GO

-- 6. Get invoice details with price (for printing)
CREATE PROCEDURE sp_GetInvoiceDetailsWithPrice
    @invoiceId INT
AS
BEGIN
    SELECT ct.id, ct.idHoaDonBan, ct.idMonAn, ct.soLuong,
           ma.tenMonAn, ma.giaTien as GiaMonAn
    FROM ChiTietHoaDonBan ct
    INNER JOIN MonAn ma ON ct.idMonAn = ma.id
    WHERE ct.idHoaDonBan = @invoiceId;
END
GO

-- Order Stored Procedures

-- 1. Get all orders
CREATE PROCEDURE sp_GetAllOrders
AS
BEGIN
    SELECT id, thoiDiemVao, thoiDiemRa, idBanan, trangThaiHD, idNhanVien 
    FROM HoaDonBan;
END
GO

-- 2. Get order by ID
CREATE PROCEDURE sp_GetOrderById
    @Id INT
AS
BEGIN
    SELECT id, thoiDiemVao, thoiDiemRa, idBanan, trangThaiHD, idNhanVien 
    FROM HoaDonBan 
    WHERE id = @Id;
END
GO

-- 3. Create new order
CREATE PROCEDURE sp_CreateOrder
    @ThoiDiemVao DATETIME,
    @IdBanan INT,
    @TrangThaiHD INT,
    @IdNhanVien INT = NULL
AS
BEGIN
    INSERT INTO HoaDonBan (thoiDiemVao, idBanan, trangThaiHD, idNhanVien) 
    VALUES (@ThoiDiemVao, @IdBanan, @TrangThaiHD, @IdNhanVien);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 4. Update order
CREATE PROCEDURE sp_UpdateOrder
    @Id INT,
    @ThoiDiemRa DATETIME = NULL,
    @IdNhanVien INT = NULL
AS
BEGIN
    UPDATE HoaDonBan 
    SET thoiDiemRa = @ThoiDiemRa, idNhanVien = @IdNhanVien 
    WHERE id = @Id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 5. Delete order
CREATE PROCEDURE sp_DeleteOrder
    @Id INT
AS
BEGIN
    DELETE FROM HoaDonBan WHERE id = @Id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 6. Update order status
CREATE PROCEDURE sp_UpdateOrderStatus
    @Id INT,
    @TrangThaiHD INT,
    @ThoiDiemRa DATETIME = NULL
AS
BEGIN
    UPDATE HoaDonBan 
    SET trangThaiHD = @TrangThaiHD, thoiDiemRa = @ThoiDiemRa 
    WHERE id = @Id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 7. Get orders by table ID
CREATE PROCEDURE sp_GetOrdersByTableId
    @IdBanan INT
AS
BEGIN
    SELECT id, thoiDiemVao, thoiDiemRa, idBanan, trangThaiHD, idNhanVien 
    FROM HoaDonBan 
    WHERE idBanan = @IdBanan;
END
GO

-- 8. Get order details
CREATE PROCEDURE sp_GetOrderDetails
    @IdHoaDonBan INT
AS
BEGIN
    SELECT idHoaDonBan, idMonAn, soLuong 
    FROM ChiTietHoaDonBan 
    WHERE idHoaDonBan = @IdHoaDonBan;
END
GO

-- 9. Create order detail
CREATE PROCEDURE sp_CreateOrderDetail
    @IdHoaDonBan INT,
    @IdMonAn INT,
    @SoLuong INT
AS
BEGIN
    INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong)
    VALUES (@IdHoaDonBan, @IdMonAn, @SoLuong);
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 10. Delete order details by order ID
CREATE PROCEDURE sp_DeleteOrderDetailsByOrderId
    @IdHoaDonBan INT
AS
BEGIN
    DELETE FROM ChiTietHoaDonBan WHERE idHoaDonBan = @IdHoaDonBan;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- Reports Stored Procedures

-- 1. Get top 5 best selling products
CREATE PROCEDURE sp_GetTop5BestSellingProducts
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(4000) = '
    SELECT TOP 5 
        m.id AS IdMonAn,
        m.tenMonAn AS TenMonAn,
        SUM(ct.soLuong) as TongSoLuongBan,
        m.giaTien AS GiaBan,
        SUM(ct.soLuong * m.giaTien) as TongDoanhThu
    FROM ChiTietHoaDonBan ct
    INNER JOIN MonAn m ON ct.idMonAn = m.id
    INNER JOIN HoaDonBan h ON ct.idHoaDonBan = h.id
    WHERE h.trangThaiHD = 1';

    IF @TuNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao >= @TuNgay';
    
    IF @DenNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao <= @DenNgay';

    SET @sql = @sql + '
    GROUP BY m.id, m.tenMonAn, m.giaTien
    ORDER BY TongSoLuongBan DESC';

    EXEC sp_executesql @sql, 
        N'@TuNgay DATETIME, @DenNgay DATETIME', 
        @TuNgay, @DenNgay;
END
GO

-- 2. Get total revenue
CREATE PROCEDURE sp_GetTotalRevenue
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(4000) = '
    SELECT 
        ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongDoanhThu,
        COUNT(DISTINCT h.id) as SoDonHang
    FROM HoaDonBan h
    INNER JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
    INNER JOIN MonAn m ON ct.idMonAn = m.id
    WHERE h.trangThaiHD = 1';

    IF @TuNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao >= @TuNgay';
    
    IF @DenNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao <= @DenNgay';

    EXEC sp_executesql @sql, 
        N'@TuNgay DATETIME, @DenNgay DATETIME', 
        @TuNgay, @DenNgay;
END
GO

-- 3. Get total products sold
CREATE PROCEDURE sp_GetTotalProductsSold
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(4000) = '
    SELECT 
        ISNULL(SUM(ct.soLuong), 0) as TongSoLuongDaBan,
        COUNT(DISTINCT ct.idMonAn) as SoLoaiMonAn
    FROM ChiTietHoaDonBan ct
    INNER JOIN HoaDonBan h ON ct.idHoaDonBan = h.id
    WHERE h.trangThaiHD = 1';

    IF @TuNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao >= @TuNgay';
    
    IF @DenNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao <= @DenNgay';

    EXEC sp_executesql @sql, 
        N'@TuNgay DATETIME, @DenNgay DATETIME', 
        @TuNgay, @DenNgay;
END
GO

-- 4. Get average order value
CREATE PROCEDURE sp_GetAverageOrderValue
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(4000) = '
    SELECT 
        COUNT(DISTINCT h.id) as TongSoDonHang,
        ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongDoanhThu
    FROM HoaDonBan h
    INNER JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
    INNER JOIN MonAn m ON ct.idMonAn = m.id
    WHERE h.trangThaiHD = 1';

    IF @TuNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao >= @TuNgay';
    
    IF @DenNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao <= @DenNgay';

    EXEC sp_executesql @sql, 
        N'@TuNgay DATETIME, @DenNgay DATETIME', 
        @TuNgay, @DenNgay;
END
GO

-- 5. Get orders summary
CREATE PROCEDURE sp_GetOrdersSummary
    @TuNgay DATETIME = NULL,
    @DenNgay DATETIME = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(4000) = '
    SELECT 
        h.id as IdHoaDonBan,
        h.thoiDiemVao as NgayBan,
        CASE h.trangThaiHD 
            WHEN 0 THEN N''Chưa thanh toán''
            WHEN 1 THEN N''Đã thanh toán''
            ELSE N''Không xác định''
        END as TrangThai,
        ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongTien,
        b.tenBan as TenBan,
        nv.hoTen as TenNhanVien
    FROM HoaDonBan h
    INNER JOIN Ban b ON h.idBanAn = b.id
    LEFT JOIN NhanVien nv ON h.idNhanVien = nv.id
    LEFT JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
    LEFT JOIN MonAn m ON ct.idMonAn = m.id
    WHERE 1=1';

    IF @TuNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao >= @TuNgay';
    
    IF @DenNgay IS NOT NULL
        SET @sql = @sql + ' AND h.thoiDiemVao <= @DenNgay';

    SET @sql = @sql + '
    GROUP BY h.id, h.thoiDiemVao, h.trangThaiHD, b.tenBan, nv.hoTen
    ORDER BY h.thoiDiemVao DESC';

    EXEC sp_executesql @sql, 
        N'@TuNgay DATETIME, @DenNgay DATETIME', 
        @TuNgay, @DenNgay;
END
GO

-- Suppliers Stored Procedures

-- 1. Get all suppliers
CREATE PROCEDURE sp_GetAllSuppliers
AS
BEGIN
    SELECT id, tenNhaCungCap, diaChi, sdt, email 
    FROM NhaCungCap 
    ORDER BY tenNhaCungCap;
END
GO

-- 2. Get supplier by ID
CREATE PROCEDURE sp_GetSupplierById
    @id INT
AS
BEGIN
    SELECT id, tenNhaCungCap, diaChi, sdt, email 
    FROM NhaCungCap 
    WHERE id = @id;
END
GO

-- 3. Create new supplier (for CreateSupplierRequest)
CREATE PROCEDURE sp_CreateSupplierFromRequest
    @tenNhaCungCap NVARCHAR(255),
    @diaChi NVARCHAR(500) = NULL,
    @sdt NVARCHAR(20) = NULL,
    @email NVARCHAR(100) = NULL
AS
BEGIN
    INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) 
    VALUES (@tenNhaCungCap, @diaChi, @sdt, @email);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 4. Create new supplier (for SupplierModel)
CREATE PROCEDURE sp_CreateSupplier
    @tenNhaCungCap NVARCHAR(255),
    @diaChi NVARCHAR(500) = NULL,
    @sdt NVARCHAR(20) = NULL,
    @email NVARCHAR(100) = NULL
AS
BEGIN
    INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) 
    VALUES (@tenNhaCungCap, @diaChi, @sdt, @email);
    SELECT SCOPE_IDENTITY() AS NewID;
END
GO

-- 5. Update supplier
CREATE PROCEDURE sp_UpdateSupplier
    @id INT,
    @tenNhaCungCap NVARCHAR(255),
    @diaChi NVARCHAR(500) = NULL,
    @sdt NVARCHAR(20) = NULL,
    @email NVARCHAR(100) = NULL
AS
BEGIN
    UPDATE NhaCungCap 
    SET tenNhaCungCap = @tenNhaCungCap, diaChi = @diaChi, sdt = @sdt, email = @email 
    WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO

-- 6. Delete supplier
CREATE PROCEDURE sp_DeleteSupplier
    @id INT
AS
BEGIN
    DELETE FROM NhaCungCap WHERE id = @id;
    SELECT @@ROWCOUNT AS RowsAffected;
END
GO



