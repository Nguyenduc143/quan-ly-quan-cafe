-- Tạo database
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
	tenHienThi NVARCHAR(100) NOT NULL DEFAULT N'NgDucHuy',
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

 
INSERT INTO TaiKhoan (tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien) VALUES
('admin',N'admin','1',1, 9),
('duchuy', N'Đức Huy', '1', 0,1),
('vanHung', N'Văn Hùng', '1', 0,2),
('thuTran', N'Thị Thu', '1', 0,3),
('minhHoang', N'Minh Hoàng', '1', 0,4),
('ngocAnh', N'Ngọc Ánh', '1', 0,5),
('quangAnh', N'Quang Anh', '1', 0,6),
('haiYen', N'Hải Yến', '1', 0,7),
('vanTu', N'Văn Tú', '1', 0,8),
('nhatMinh', N'Nhật Minh', '1', 0,10);
select * from TaiKhoan

INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi) VALUES
(N'Nguyễn Đức Huy', '2005-01-25', N'Nam', '0336113905', N'Hưng Yên'),
(N'Nguyễn Văn Hùng', '1995-08-20', N'Nam', '0902222222', N'HCM'),
(N'Trần Thị Thu', '2000-01-15', N'Nữ', '0903333333', N'Đà Nẵng'),
(N'Phạm Minh Hoàng', '1997-03-09', N'Nam', '0904444444', N'Hải Phòng'),
(N'Vũ Ngọc Ánh', '1998-11-21', N'Nữ', '0905555555', N'Cần Thơ'),
(N'Bùi Quang Anh', '1996-07-04', N'Nam', '0906666666', N'Hà Nội'),
(N'Lương Hải Yến', '1999-09-30', N'Nữ', '0907777777', N'Nghệ An'),
(N'Đinh Văn Tú', '1995-02-18', N'Nam', '0908888888', N'Bình Dương'),
(N'Hồ Thị Hằng', '1998-12-25', N'Nữ', '0909999999', N'Quảng Ninh'),
(N'Nguyễn Nhật Minh', '2001-04-01', N'Nam', '0901234567', N'TP.HCM');
SELECT * FROM NhanVien

INSERT INTO DanhMucMonAn (tenDanhMuc) VALUES
(N'Trà sữa'),
(N'Trà trái cây'),
(N'Topping'),
(N'Bánh ngọt'),
(N'Nước ép'),
(N'Cà phê'),
(N'Sữa chua'),
(N'Trà nóng'),
(N'Snack'),
(N'Đặc biệt'),
(N'Combo'),
(N'Macchiato'),
(N'Trà sữa không đường'),
(N'Sữa tươi trân châu'),
(N'Trà sữa vị trái cây'),
(N'Trà chanh'),
(N'Soda Ý'),
(N'Mocha/Cacao'),
(N'Nước khoáng'),
(N'Trà Sữa Nhật Bản'),
(N'Trà Sữa Hàn Quốc');
SELECT * FROM DanhMucMonAn

INSERT INTO MonAn (tenMonAn, idDanhMuc, giaTien) VALUES
(N'Trà sữa trân châu đường đen', 1, 35000),
(N'Trà sữa socola', 1, 33000),
(N'Trà sữa khoai môn', 1, 34000),

(N'Trà đào', 2, 30000),
(N'Trà vải', 2, 30000),
(N'Trà cam xả', 2, 32000),

(N'Trân châu đen', 3, 5000),
(N'Trân châu trắng', 3, 6000),
(N'Pudding trứng', 3, 7000),

(N'Bánh tiramisu', 4, 25000),
(N'Bánh flan', 4, 20000),
(N'Bánh su kem', 4, 22000),

(N'Nước ép cam', 5, 28000),
(N'Nước ép dứa', 5, 29000),
(N'Nước ép ổi', 5, 27000),

(N'Cà phê sữa đá', 6, 27000),
(N'Cà phê đen', 6, 25000),
(N'Bạc xỉu', 6, 29000),

(N'Sữa chua nếp cẩm', 7, 30000),
(N'Sữa chua trái cây', 7, 32000),
(N'Sữa chua nha đam', 7, 31000),

(N'Trà gừng nóng', 8, 26000),
(N'Trà đào nóng', 8, 27000),
(N'Trà chanh nóng', 8, 25000),

(N'Snack rong biển', 9, 15000),
(N'Snack khoai tây', 9, 18000),
(N'Snack phô mai', 9, 17000),

(N'Trà sữa trứng muối', 10, 38000),
(N'Trà sữa kem cheese', 10, 39000),
(N'Trà sữa sầu riêng', 10, 37000),

(N'Combo trà sữa + bánh flan', 11, 50000),
(N'Combo trà trái cây + snack', 11, 45000),
(N'Combo cà phê + bánh su kem', 11, 47000),

(N'Matcha macchiato', 12, 39000),
(N'Chocolate macchiato', 12, 38000),
(N'Milo macchiato', 12, 37000),

(N'Trà sữa không đường nguyên chất', 13, 30000),
(N'Trà sữa không đường trân châu trắng', 13, 31000),
(N'Trà sữa không đường kem cheese', 13, 32000),

(N'Sữa tươi trân châu hoàng kim', 14, 36000),
(N'Sữa tươi trân châu baby', 14, 35000),
(N'Sữa tươi trân châu dâu', 14, 37000),

(N'Trà sữa việt quất', 15, 34000),
(N'Trà sữa xoài', 15, 33000),
(N'Trà sữa chanh leo', 15, 32000),

(N'Trà chanh truyền thống', 16, 27000),
(N'Trà chanh sả', 16, 28000),
(N'Trà chanh gừng', 16, 29000),

(N'Soda dâu', 17, 30000),
(N'Soda việt quất', 17, 31000),
(N'Soda chanh', 17, 32000),

(N'Mocha đá xay', 18, 35000),
(N'Cacao nóng', 18, 34000),
(N'Cacao sữa đá', 18, 33000),

(N'Nước khoáng Lavie', 19, 15000),
(N'Nước khoáng Aquafina', 19, 15000),
(N'Nước khoáng Dasani', 19, 15000),

(N'Trà sữa sakura', 20, 39000),
(N'Trà sữa matcha Nhật', 20, 40000),
(N'Trà sữa houjicha', 20, 42000),

(N'Trà sữa chuối', 21, 37000),
(N'Trà sữa đào Hàn', 21, 38000),
(N'Trà sữa caramel', 21, 39000);
SELECT * FROM MonAn

INSERT INTO CongThucMonAn (idMonAn, idNguyenLieu, soLuong, donViTinh) VALUES
-- Trà sữa trân châu đường đen (idMonAn = 15)
(15, 12, 0.1, N'gói'),    -- Lá trà đen
(15, 13, 0.2, N'kg'),     -- Sữa bột
(15, 14, 0.05, N'kg'),    -- Đường trắng
(15, 18, 0.05, N'kg'),    -- Trân châu đen sống

-- Trà sữa socola (idMonAn = 16)
(16, 12, 0.1, N'gói'),    -- Lá trà đen
(16, 13, 0.2, N'kg'),     -- Sữa bột
(16, 72, 0.02, N'gói'),   -- Bột cacao

-- Trà sữa khoai môn (idMonAn = 17)
(17, 12, 0.1, N'gói'),    -- Lá trà đen
(17, 13, 0.2, N'kg'),     -- Sữa bột
-- Giả định thêm tinh chất khoai môn (idNguyenLieu = 75)
(17, 75, 0.03, N'lít'),   -- Tinh chất khoai môn (giả định)

-- Trà đào (idMonAn = 18)
(18, 15, 0.1, N'hộp'),    -- Trà đào túi lọc
(18, 14, 0.02, N'kg'),    -- Đường trắng
(18, 48, 0.3, N'lít'),    -- Nước sôi

-- Trà vải (idMonAn = 19)
(19, 12, 0.05, N'gói'),   -- Lá trà đen
(19, 16, 0.05, N'lít'),   -- Syrup vải
(19, 14, 0.02, N'kg'),    -- Đường trắng
(19, 48, 0.3, N'lít'),    -- Nước sôi

-- Trà cam xả (idMonAn = 20)
(20, 12, 0.05, N'gói'),   -- Lá trà đen
(20, 17, 0.05, N'lít'),   -- Syrup cam xả
(20, 14, 0.02, N'kg'),    -- Đường trắng
(20, 48, 0.3, N'lít'),    -- Nước sôi

-- Trân châu đen (idMonAn = 21)
(21, 18, 0.05, N'kg'),    -- Trân châu đen sống

-- Trân châu trắng (idMonAn = 22)
(22, 19, 0.05, N'kg'),    -- Trân châu trắng sống

-- Pudding trứng (idMonAn = 23)
(23, 20, 0.02, N'kg'),    -- Bột flan
(23, 13, 0.05, N'kg'),    -- Sữa bột

-- Bánh tiramisu (idMonAn = 24)
(24, 21, 0.05, N'kg'),    -- Bột bánh tiramisu
(24, 22, 0.02, N'lít'),   -- Whipping cream
(24, 23, 0.01, N'kg');    -- Bơ lạt
SELECT * FROM CongThucMonAn;
SELECT * FROM KhoNguyenLieu;

INSERT INTO HoaDonBan (thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien) VALUES
(GETDATE(), NULL, 1, 0, 1),
(GETDATE(), GETDATE(), 2, 1, 2),
(GETDATE(), NULL, 3, 0, 3),
(GETDATE(), GETDATE(), 4, 1, 4),
(GETDATE(), NULL, 5, 0, 5),
(GETDATE(), GETDATE(), 6, 1, 6),
(GETDATE(), NULL, 7, 0, 7),
(GETDATE(), GETDATE(), 8, 1, 8),
(GETDATE(), NULL, 9, 0, 9),
(GETDATE(), GETDATE(), 10, 1, 10);
SELECT * FROM HoaDonBan

INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong) VALUES
(14, 29, 2),
(15, 34, 1),
(16, 23, 1),
(17, 46, 3),
(18, 53, 1),
(19, 65, 1),
(20, 37, 2),
(21, 58, 1),
(22, 19, 2),
(23, 17, 1);
SELECT * FROM ChiTietHoaDonBan

INSERT INTO KhoNguyenLieu (tenNguyenLieu, donViTinh, soLuongTon, ghiChu) VALUES
(N'Lá trà đen', N'gói', 50, N'Pha trà sữa'),
(N'Sữa bột', N'kg', 30, N'Dùng pha trà sữa'),
(N'Đường trắng', N'kg', 100, N'Ngọt'),

(N'Trà đào túi lọc', N'hộp', 20, N'Dùng pha trà'),
(N'Syrup vải', N'lít', 25, N'Tạo vị trái cây'),
(N'Syrup cam xả', N'lít', 15, N'Tạo hương'),

(N'Trân châu đen sống', N'kg', 40, N'Topping phổ biến'),
(N'Trân châu trắng sống', N'kg', 30, N'Trắng trong'),
(N'Bột flan', N'kg', 10, N'Làm pudding'),

(N'Bột bánh tiramisu', N'kg', 10, N'Bánh ngọt'),
(N'Whipping cream', N'lít', 12, N'Làm bánh'),
(N'Bơ lạt', N'kg', 8, N'Nguyên liệu bánh'),

(N'Cam tươi', N'quả', 50, N'Ép nước'),
(N'Dứa', N'quả', 40, N'Ép nước'),
(N'Ổi', N'quả', 35, N'Ép nước'),

(N'Hạt cà phê rang', N'kg', 20, N'Pha máy'),
(N'Sữa đặc', N'lít', 25, N'Bạc xỉu'),
(N'Nước lọc', N'lít', 100, N'Pha cà phê'),

(N'Sữa chua hộp', N'hộp', 30, N'Nguyên liệu chính'),
(N'Nếp cẩm', N'kg', 10, N'Sữa chua nếp cẩm'),
(N'Nha đam tươi', N'kg', 12, N'Sữa chua nha đam'),

(N'Trà gừng', N'gói', 20, N'Trà nóng'),
(N'Trà đào túi lọc', N'gói', 18, N'Trà nóng'),
(N'Trà chanh túi lọc', N'gói', 15, N'Trà nóng'),

(N'Snack rong biển gói', N'gói', 50, N'Ăn vặt'),
(N'Snack khoai', N'gói', 60, N'Ăn vặt'),
(N'Snack phô mai', N'gói', 55, N'Ăn vặt'),

(N'Bột trứng muối', N'gói', 10, N'Topping đặc biệt'),
(N'Kem cheese', N'lít', 8, N'Ngậy béo'),
(N'Tinh chất sầu riêng', N'lít', 5, N'Mùi mạnh'),

(N'Hộp combo', N'hộp', 30, N'Đóng gói combo'),
(N'Tem combo', N'cái', 60, N'Dán ngoài combo'),
(N'Bánh su kem', N'cái', 20, N'Dùng trong combo'),

(N'Bột matcha', N'gói', 15, N'Macchiato'),
(N'Bột milo', N'gói', 10, N'Macchiato'),
(N'Kem tươi', N'lít', 8, N'Macchiato'),

(N'Lá trà oolong', N'gói', 20, N'Trà sữa không đường'),
(N'Nước sôi', N'lít', 100, N'Dùng pha'),
(N'Kem không đường', N'lít', 10, N'Ít calo'),

(N'Sữa tươi', N'lít', 40, N'Sữa tươi trân châu'),
(N'Trân châu hoàng kim', N'kg', 25, N'Trân châu đặc biệt'),
(N'Siro dâu', N'lít', 18, N'Topping'),

(N'Syrup việt quất', N'lít', 10, N'Vị trái cây'),
(N'Syrup xoài', N'lít', 12, N'Vị trái cây'),
(N'Syrup chanh leo', N'lít', 14, N'Vị trái cây'),

(N'Chanh tươi', N'quả', 60, N'Trà chanh'),
(N'Sả tươi', N'cây', 25, N'Chanh sả'),
(N'Gừng tươi', N'kg', 15, N'Chanh gừng'),

(N'Syrup dâu', N'lít', 20, N'Soda'),
(N'Syrup việt quất', N'lít', 18, N'Soda'),
(N'Soda base', N'lít', 30, N'Nước nền'),

(N'Bột mocha', N'gói', 12, N'Mocha đá xay'),
(N'Bột cacao', N'gói', 14, N'Nóng/lạnh'),
(N'Sữa tươi có đường', N'lít', 20, N'Cacao đá'),

(N'Nước Lavie', N'chai', 50, N'Nước uống'),
(N'Nước Aquafina', N'chai', 40, N'Nước uống'),
(N'Nước Dasani', N'chai', 30, N'Nước uống'),

(N'Bột sakura', N'gói', 10, N'Trà Nhật'),
(N'Bột matcha Nhật', N'gói', 8, N'Trà Nhật'),
(N'Bột houjicha', N'gói', 5, N'Trà Nhật'),

(N'Tinh chất chuối', N'lít', 10, N'Hàn Quốc'),
(N'Tinh chất đào', N'lít', 10, N'Hàn Quốc'),
(N'Tinh chất caramel', N'lít', 10, N'Hàn Quốc');
SELECT * FROM KhoNguyenLieu


INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) VALUES
(N'Công ty Nguyên liệu ABC', N'Hà Nội', '0911111111', 'abc@nguyenlieu.com'),
(N'Trân Châu Việt', N'TPHCM', '0922222222', 'tran.chau@viet.vn'),
(N'Đường Nâu Co.', N'Đồng Nai', '0933333333', 'duongnau@co.com'),
(N'Công ty Trà Xanh', N'Lâm Đồng', '0944444444', 'traxanh@ld.com'),
(N'Fruit Fresh', N'HCM', '0955555555', 'fruit@fresh.com'),
(N'Sữa Thật', N'Hà Nội', '0966666666', 'sua@that.vn'),
(N'Bánh Ngọt Co.', N'TPHCM', '0977777777', 'banhngot@co.vn'),
(N'Nước Ép Tự Nhiên', N'Cần Thơ', '0988888888', 'nuocep@natural.com'),
(N'Thực Phẩm Sạch', N'Hà Nội', '0999999999', 'sach@thucpham.vn'),
(N'Nguyên Liệu Số 1', N'Đà Nẵng', '0900000000', 'so1@nguyenlieu.com'),
(N'Công ty bánh kẹo Oishi', N'Hà Nội', '0900000999', 'oishi@bimbim.com');
SELECT * FROM NhaCungCap;





