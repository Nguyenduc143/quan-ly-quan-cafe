
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
