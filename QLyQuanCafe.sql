-- Tạo database
CREATE DATABASE QLyQuanTraSua
GO

USE QLyQuanTraSua
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

create proc GetAccountByUserName
@username nvarchar(100)
as
begin
	select * from dbo.TaiKhoan where tenDangNhap = @username
end
go

EXEC dbo.GetAccountByUserName @username = N'admin';

CREATE PROCEDURE sp_KiemTraDangNhap
    @TenDangNhap NVARCHAR(100),
    @MatKhau NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT tenDangNhap, tenHienThi, loaiTaiKhoan
    FROM TaiKhoan
    WHERE tenDangNhap = @TenDangNhap AND matKhau = @MatKhau
END
go

CREATE PROCEDURE sp_GetChiTietHoaDonTheoBan
    @idBan INT
AS
BEGIN
    SELECT 
        ma.tenMonAn,
        dm.tenDanhMuc,
        ma.giaTien,
        cthd.soLuong,
        (cthd.soLuong * ma.giaTien) AS ThanhTien
    FROM HoaDonBan hd
    JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    JOIN MonAn ma ON cthd.idMonAn = ma.id
    JOIN DanhMucMonAn dm ON ma.idDanhMuc = dm.id
    WHERE hd.idBanAn = @idBan AND hd.trangThaiHD = 0
END

EXEC sp_GetChiTietHoaDonTheoBan @idBan = 1

CREATE PROCEDURE sp_GetChiTietHoaDonTheoBan_AllStatus
    @idBan INT
AS
BEGIN
    SELECT 
        cthd.idHoaDonBan,
        ma.tenMonAn,
        dm.tenDanhMuc,
        ma.giaTien,
        cthd.soLuong,
        (cthd.soLuong * ma.giaTien) AS ThanhTien
    FROM HoaDonBan hd
    JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    JOIN MonAn ma ON cthd.idMonAn = ma.id
    JOIN DanhMucMonAn dm ON ma.idDanhMuc = dm.id
    WHERE hd.idBanAn = @idBan
END

CREATE PROCEDURE sp_ThemMonAnVaoBan
    @idBan INT,
    @idMonAn INT,
    @soLuong INT
AS
BEGIN
    DECLARE @idHoaDonBan INT;

    -- Tìm hóa đơn chưa thanh toán
    SELECT @idHoaDonBan = id FROM HoaDonBan WHERE idBanAn = @idBan AND TrangThaiHD = 0

    IF @idHoaDonBan IS NULL
    BEGIN
        INSERT INTO HoaDonBan(idBanAn, thoiDiemVao, trangThaiHD)
        VALUES(@idBan, GETDATE(), 0)

        SET @idHoaDonBan = SCOPE_IDENTITY()

        -- Cập nhật trạng thái bàn
        UPDATE Ban SET trangThai = N'Đã có người' WHERE id = @idBan
    END

    -- Thêm món ăn vào chi tiết hóa đơn
    IF EXISTS (SELECT * FROM ChiTietHoaDonBan WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn)
    BEGIN
        UPDATE ChiTietHoaDonBan
        SET SoLuong = SoLuong + @soLuong
        WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn
    END
    ELSE
    BEGIN
        INSERT INTO ChiTietHoaDonBan(idHoaDonBan, idMonAn, SoLuong)
        VALUES(@idHoaDonBan, @idMonAn, @soLuong)
    END
END

EXEC sp_ThemMonAnVaoBan @idBan = 19, @idMonAn = 15, @soLuong = 1


CREATE OR ALTER PROCEDURE sp_ChuyenBan
    @idBanNguon INT,
    @idBanDich INT,
    @result BIT OUTPUT -- Kết quả: 1 = thành công, 0 = thất bại
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idHoaDonNguon INT;
    DECLARE @idHoaDonDich INT;

    -- Tìm hóa đơn chưa thanh toán của bàn nguồn
    SELECT @idHoaDonNguon = id
    FROM HoaDonBan
    WHERE idBanAn = @idBanNguon AND trangThaiHD = 0;

    IF @idHoaDonNguon IS NULL
    BEGIN
        SET @result = 0; -- Thất bại: Không có hóa đơn để chuyển
        RETURN;
    END

    -- Tìm hóa đơn chưa thanh toán của bàn đích
    SELECT @idHoaDonDich = id
    FROM HoaDonBan
    WHERE idBanAn = @idBanDich AND trangThaiHD = 0;

    BEGIN TRANSACTION;
    BEGIN TRY
        IF @idHoaDonDich IS NOT NULL
        BEGIN
            -- Gộp hóa đơn: Chuyển các món từ hóa đơn của bàn nguồn sang hóa đơn của bàn đích
            -- Duyệt qua từng món trong hóa đơn của bàn nguồn
            DECLARE @idMonAn INT;
            DECLARE @soLuong INT;
            DECLARE cursorChiTiet CURSOR FOR
                SELECT idMonAn, soLuong
                FROM ChiTietHoaDonBan
                WHERE idHoaDonBan = @idHoaDonNguon;

            OPEN cursorChiTiet;
            FETCH NEXT FROM cursorChiTiet INTO @idMonAn, @soLuong;

            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- Kiểm tra xem món ăn đã tồn tại trong hóa đơn của bàn đích chưa
                IF EXISTS (SELECT 1 FROM ChiTietHoaDonBan WHERE idHoaDonBan = @idHoaDonDich AND idMonAn = @idMonAn)
                BEGIN
                    -- Nếu đã tồn tại, cộng dồn số lượng
                    UPDATE ChiTietHoaDonBan
                    SET soLuong = soLuong + @soLuong
                    WHERE idHoaDonBan = @idHoaDonDich AND idMonAn = @idMonAn;
                END
                ELSE
                BEGIN
                    -- Nếu chưa tồn tại, thêm mới vào hóa đơn của bàn đích
                    INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong)
                    VALUES (@idHoaDonDich, @idMonAn, @soLuong);
                END

                FETCH NEXT FROM cursorChiTiet INTO @idMonAn, @soLuong;
            END;

            CLOSE cursorChiTiet;
            DEALLOCATE cursorChiTiet;

            -- Xóa các món trong hóa đơn của bàn nguồn
            DELETE FROM ChiTietHoaDonBan
            WHERE idHoaDonBan = @idHoaDonNguon;

            -- Xóa hóa đơn của bàn nguồn
            DELETE FROM HoaDonBan
            WHERE id = @idHoaDonNguon;
        END
        ELSE
        BEGIN
            -- Nếu bàn đích không có hóa đơn, chuyển toàn bộ hóa đơn từ bàn nguồn sang bàn đích
            UPDATE HoaDonBan
            SET idBanAn = @idBanDich
            WHERE id = @idHoaDonNguon;
        END

        -- Cập nhật trạng thái bàn
        UPDATE Ban
        SET trangThai = N'Trống'
        WHERE id = @idBanNguon;

        UPDATE Ban
        SET trangThai = N'Đã có người'
        WHERE id = @idBanDich;

        SET @result = 1; -- Thành công
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        SET @result = 0; -- Thất bại
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    END CATCH
END

CREATE  PROCEDURE sp_ThanhToanHoaDon
    @idBan INT,
    @giamGia FLOAT, -- Tỷ lệ giảm giá (phần trăm, ví dụ: 10% = 10.0)
    @idNhanVien INT -- ID nhân viên thực hiện thanh toán
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idHoaDon INT;
    DECLARE @tongTien FLOAT;

    -- Tìm hóa đơn chưa thanh toán của bàn
    SELECT @idHoaDon = id
    FROM HoaDonBan
    WHERE idBanAn = @idBan AND trangThaiHD = 0;

    IF @idHoaDon IS NOT NULL
    BEGIN
        -- Tính tổng tiền từ ChiTietHoaDonBan
        SELECT @tongTien = SUM(cthd.soLuong * ma.giaTien)
        FROM ChiTietHoaDonBan cthd
        JOIN MonAn ma ON cthd.idMonAn = ma.id
        WHERE cthd.idHoaDonBan = @idHoaDon;

        -- Áp dụng giảm giá
        IF @giamGia > 0
        BEGIN
            SET @tongTien = @tongTien * (1 - @giamGia / 100.0);
        END

        -- Cập nhật trạng thái hóa đơn và idNhanVien
        UPDATE HoaDonBan
        SET trangThaiHD = 1,
            thoiDiemRa = GETDATE(),
            idNhanVien = @idNhanVien -- Cập nhật idNhanVien thành nhân viên thực hiện thanh toán
        WHERE id = @idHoaDon;

        -- Cập nhật trạng thái bàn
        UPDATE Ban
        SET trangThai = N'Trống'
        WHERE id = @idBan;

        -- Trả về tổng tiền sau giảm giá
        SELECT @tongTien AS TongTienSauGiamGia;
    END
    ELSE
    BEGIN
        -- Nếu không tìm thấy hóa đơn, trả về tổng tiền = 0
        SELECT 0.0 AS TongTienSauGiamGia;
    END
END

USE QLyQuanTraSua
GO

CREATE OR ALTER PROCEDURE sp_LayDanhSachHoaDon
    @tuNgay DATE = NULL, -- Từ ngày (NULL nếu không lọc)
    @denNgay DATE = NULL, -- Đến ngày (NULL nếu không lọc)
    @idNhanVien INT = NULL -- ID nhân viên (NULL nếu không lọc theo idNhanVien)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        hd.id,
        hd.idBanAn,
        hd.thoiDiemVao,
        hd.thoiDiemRa,
        hd.idNhanVien,
        nv.hoTen, -- Thêm cột hoTen từ bảng NhanVien
        hd.trangThaiHD,
        COALESCE(SUM(cthd.soLuong * ma.giaTien), 0) AS TongTien
    FROM HoaDonBan hd
    LEFT JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    LEFT JOIN MonAn ma ON cthd.idMonAn = ma.id
    LEFT JOIN NhanVien nv ON hd.idNhanVien = nv.id -- Tham chiếu đến bảng NhanVien
    WHERE 
        (@tuNgay IS NULL OR @denNgay IS NULL OR (CAST(hd.thoiDiemVao AS DATE) BETWEEN @tuNgay AND @denNgay))
        AND (@idNhanVien IS NULL OR hd.idNhanVien = @idNhanVien)
    GROUP BY 
        hd.id,
        hd.idBanAn,
        hd.thoiDiemVao,
        hd.thoiDiemRa,
        hd.idNhanVien,
        nv.hoTen,
        hd.trangThaiHD;
END

EXEC sp_LayDanhSachHoaDon @tuNgay = NULL, @denNgay = NULL, @idNhanVien = null;

CREATE OR ALTER PROCEDURE sp_ThemMonAnVaoBan
    @idBan INT,
    @idMonAn INT,
    @soLuong INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idHoaDonBan INT;

    -- Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Tìm hóa đơn chưa thanh toán
        SELECT @idHoaDonBan = id FROM HoaDonBan WHERE idBanAn = @idBan AND TrangThaiHD = 0;

        IF @idHoaDonBan IS NULL
        BEGIN
            INSERT INTO HoaDonBan(idBanAn, thoiDiemVao, trangThaiHD)
            VALUES(@idBan, GETDATE(), 0);

            SET @idHoaDonBan = SCOPE_IDENTITY();

            -- Cập nhật trạng thái bàn
            UPDATE Ban SET trangThai = N'Đã có người' WHERE id = @idBan;
        END

        -- Lấy danh sách nguyên liệu cần cho món ăn
        DECLARE @idNguyenLieu INT;
        DECLARE @soLuongCan FLOAT;
        DECLARE @donViTinh NVARCHAR(50);
        DECLARE @soLuongTon FLOAT;

        DECLARE cursorCongThuc CURSOR FOR
            SELECT idNguyenLieu, soLuong, donViTinh
            FROM CongThucMonAn
            WHERE idMonAn = @idMonAn;

        OPEN cursorCongThuc;
        FETCH NEXT FROM cursorCongThuc INTO @idNguyenLieu, @soLuongCan, @donViTinh;

        -- Kiểm tra số lượng nguyên liệu trong kho
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Tính số lượng cần dựa trên số lượng món
            SET @soLuongCan = @soLuongCan * @soLuong;

            -- Lấy số lượng tồn kho hiện tại
            SELECT @soLuongTon = soLuongTon
            FROM KhoNguyenLieu
            WHERE id = @idNguyenLieu;

            IF @soLuongTon IS NULL OR @soLuongTon < @soLuongCan
            BEGIN
                -- Nếu không đủ nguyên liệu, rollback và báo lỗi
                ROLLBACK TRANSACTION;
                THROW 50001, 'Không đủ nguyên liệu trong kho để chế biến món ăn!', 1;
                RETURN;
            END

            FETCH NEXT FROM cursorCongThuc INTO @idNguyenLieu, @soLuongCan, @donViTinh;
        END;

        CLOSE cursorCongThuc;
        DEALLOCATE cursorCongThuc;

        -- Trừ nguyên liệu trong kho
        OPEN cursorCongThuc;
        FETCH NEXT FROM cursorCongThuc INTO @idNguyenLieu, @soLuongCan, @donViTinh;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @soLuongCan = @soLuongCan * @soLuong;
            UPDATE KhoNguyenLieu
            SET soLuongTon = soLuongTon - @soLuongCan
            WHERE id = @idNguyenLieu;

            FETCH NEXT FROM cursorCongThuc INTO @idNguyenLieu, @soLuongCan, @donViTinh;
        END;

        CLOSE cursorCongThuc;
        DEALLOCATE cursorCongThuc;

        -- Thêm món ăn vào chi tiết hóa đơn
        IF EXISTS (SELECT * FROM ChiTietHoaDonBan WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn)
        BEGIN
            UPDATE ChiTietHoaDonBan
            SET SoLuong = SoLuong + @soLuong
            WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;
        END
        ELSE
        BEGIN
            INSERT INTO ChiTietHoaDonBan(idHoaDonBan, idMonAn, SoLuong)
            VALUES(@idHoaDonBan, @idMonAn, @soLuong);
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_ThemMonAnVaoBan
    @idBan INT,
    @idMonAn INT,
    @soLuong INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @idHoaDonBan INT;
    DECLARE @errorMessage NVARCHAR(4000);
    DECLARE @rowsAffected INT = 0;

    -- Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Tìm hóa đơn chưa thanh toán
        SELECT @idHoaDonBan = id FROM HoaDonBan WHERE idBanAn = @idBan AND TrangThaiHD = 0;

        IF @idHoaDonBan IS NULL
        BEGIN
            INSERT INTO HoaDonBan(idBanAn, thoiDiemVao, trangThaiHD)
            VALUES(@idBan, GETDATE(), 0);

            SET @idHoaDonBan = SCOPE_IDENTITY();

            -- Cập nhật trạng thái bàn
            UPDATE Ban SET trangThai = N'Đã có người' WHERE id = @idBan;
            SET @rowsAffected = @rowsAffected + @@ROWCOUNT;
        END

        -- Kiểm tra số lượng nguyên liệu trong kho
        IF EXISTS (
            SELECT 1
            FROM CongThucMonAn ctm
            JOIN KhoNguyenLieu knl ON ctm.idNguyenLieu = knl.id
            WHERE ctm.idMonAn = @idMonAn
            AND knl.soLuongTon < (ctm.soLuong * @soLuong)
        )
        BEGIN
            -- Lấy thông tin nguyên liệu không đủ
            SELECT TOP 1 @errorMessage = 'Không đủ nguyên liệu trong kho: ' + knl.tenNguyenLieu + 
                                         ' (Cần: ' + CAST((ctm.soLuong * @soLuong) AS NVARCHAR) + ' ' + ctm.donViTinh + 
                                         ', Tồn: ' + CAST(knl.soLuongTon AS NVARCHAR) + ' ' + ctm.donViTinh + ')'
            FROM CongThucMonAn ctm
            JOIN KhoNguyenLieu knl ON ctm.idNguyenLieu = knl.id
            WHERE ctm.idMonAn = @idMonAn
            AND knl.soLuongTon < (ctm.soLuong * @soLuong);

            ROLLBACK TRANSACTION;
            THROW 50001, @errorMessage, 1;
            RETURN;
        END;

        -- Trừ nguyên liệu trong kho
        UPDATE knl
        SET knl.soLuongTon = knl.soLuongTon - (ctm.soLuong * @soLuong)
        FROM KhoNguyenLieu knl
        JOIN CongThucMonAn ctm ON knl.id = ctm.idNguyenLieu
        WHERE ctm.idMonAn = @idMonAn;
        SET @rowsAffected = @rowsAffected + @@ROWCOUNT;

        -- Thêm món ăn vào chi tiết hóa đơn
        IF EXISTS (SELECT * FROM ChiTietHoaDonBan WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn)
        BEGIN
            UPDATE ChiTietHoaDonBan
            SET SoLuong = SoLuong + @soLuong
            WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;
            SET @rowsAffected = @rowsAffected + @@ROWCOUNT;
        END
        ELSE
        BEGIN
            INSERT INTO ChiTietHoaDonBan(idHoaDonBan, idMonAn, SoLuong)
            VALUES(@idHoaDonBan, @idMonAn, @soLuong);
            SET @rowsAffected = @rowsAffected + @@ROWCOUNT;
        END

        COMMIT TRANSACTION;

        -- Trả về số dòng bị ảnh hưởng
        SELECT @rowsAffected AS RowsAffected;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @ErrorMessage1 NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- Procedure: Lấy danh sách báo cáo doanh thu
CREATE OR ALTER PROCEDURE sp_LayDanhSachBaoCaoDoanhThu
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        bcdt.id,
        bcdt.tuNgay,
        bcdt.denNgay,
        bcdt.tongSoHoaDonBan,
        bcdt.tongSoHoaDonNhap,
        bcdt.tongDoanhThuBan,
        bcdt.tongChiPhiNhap,
        bcdt.tongDoanhThu,
        bcdt.idNhanVien,
        nv.hoTen AS tenNhanVien,
        bcdt.ngayTao,
        bcdt.ghiChu
    FROM BaoCaoDoanhThu bcdt
    LEFT JOIN NhanVien nv ON bcdt.idNhanVien = nv.id
    ORDER BY bcdt.ngayTao DESC;
END
GO

-- Procedure: Tính báo cáo doanh thu theo khoảng thời gian
CREATE OR ALTER PROCEDURE sp_ThongKeDoanhThu
    @tuNgay DATE,
    @denNgay DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @tongSoHoaDonBan INT;
    DECLARE @tongSoHoaDonNhap INT;
    DECLARE @tongDoanhThuBan FLOAT;
    DECLARE @tongChiPhiNhap FLOAT;
    DECLARE @tongDoanhThu FLOAT;

    -- Tính tổng số hóa đơn bán và doanh thu bán
    SELECT 
        @tongSoHoaDonBan = COUNT(DISTINCT hd.id),
        @tongDoanhThuBan = COALESCE(SUM(cthd.soLuong * ma.giaTien), 0)
    FROM HoaDonBan hd
    LEFT JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    LEFT JOIN MonAn ma ON cthd.idMonAn = ma.id
    WHERE hd.trangThaiHD = 1
        AND CAST(hd.thoiDiemRa AS DATE) BETWEEN @tuNgay AND @denNgay;

    -- Tính tổng số hóa đơn nhập và chi phí nhập
    SELECT 
        @tongSoHoaDonNhap = COUNT(id),
        @tongChiPhiNhap = COALESCE(SUM(tongTien), 0)
    FROM HoaDonNhap
    WHERE CAST(ngayNhap AS DATE) BETWEEN @tuNgay AND @denNgay;

    -- Tính tổng doanh thu
    SET @tongDoanhThu = @tongDoanhThuBan - @tongChiPhiNhap;

    -- Trả về kết quả
    SELECT 
        @tuNgay AS tuNgay,
        @denNgay AS denNgay,
        @tongSoHoaDonBan AS tongSoHoaDonBan,
        @tongSoHoaDonNhap AS tongSoHoaDonNhap,
        @tongDoanhThuBan AS tongDoanhThuBan,
        @tongChiPhiNhap AS tongChiPhiNhap,
        @tongDoanhThu AS tongDoanhThu;
END
GO

-- Procedure: Thêm báo cáo doanh thu
CREATE OR ALTER PROCEDURE sp_ThemBaoCaoDoanhThu
    @tuNgay DATE,
    @denNgay DATE,
    @tongSoHoaDonBan INT,
    @tongSoHoaDonNhap INT,
    @tongDoanhThuBan FLOAT,
    @tongChiPhiNhap FLOAT,
    @tongDoanhThu FLOAT,
    @idNhanVien INT,
    @ghiChu NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra idNhanVien có tồn tại
    IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE id = @idNhanVien)
    BEGIN
        THROW 50001, N'Nhân viên không tồn tại!', 1;
        RETURN;
    END

    -- Kiểm tra tuNgay <= denNgay
    IF @tuNgay > @denNgay
    BEGIN
        THROW 50002, N'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!', 1;
        RETURN;
    END

    -- Kiểm tra các giá trị số không âm
    IF @tongSoHoaDonBan < 0 OR @tongSoHoaDonNhap < 0 OR @tongDoanhThuBan < 0 OR @tongChiPhiNhap < 0
    BEGIN
        THROW 50003, N'Các giá trị số lượng và tiền không được âm!', 1;
        RETURN;
    END

    BEGIN TRY
        INSERT INTO BaoCaoDoanhThu (
            tuNgay,
            denNgay,
            tongSoHoaDonBan,
            tongSoHoaDonNhap,
            tongDoanhThuBan,
            tongChiPhiNhap,
            tongDoanhThu,
            idNhanVien,
            ngayTao,
            ghiChu
        )
        VALUES (
            @tuNgay,
            @denNgay,
            @tongSoHoaDonBan,
            @tongSoHoaDonNhap,
            @tongDoanhThuBan,
            @tongChiPhiNhap,
            @tongDoanhThu,
            @idNhanVien,
            GETDATE(),
            @ghiChu
        );

        -- Trả về ID của bản ghi mới
        SELECT SCOPE_IDENTITY() AS idBaoCaoMoi;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

-- Procedure: Xóa báo cáo doanh thu
CREATE OR ALTER PROCEDURE sp_XoaBaoCaoDoanhThu
    @idBaoCao INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra báo cáo có tồn tại không
    IF NOT EXISTS (SELECT 1 FROM BaoCaoDoanhThu WHERE id = @idBaoCao)
    BEGIN
        THROW 50004, N'Báo cáo không tồn tại!', 1;
        RETURN;
    END

    BEGIN TRY
        DECLARE @rowsAffected INT;

        DELETE FROM BaoCaoDoanhThu WHERE id = @idBaoCao;
        SET @rowsAffected = @@ROWCOUNT;

        -- Trả về số dòng bị ảnh hưởng
        SELECT @rowsAffected AS RowsAffected;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        THROW 50000, @ErrorMessage, 1;
    END CATCH
END
GO

CREATE PROCEDURE [dbo].[sp_CapNhatSoLuongMonAn]
    @idHoaDonBan INT,
    @idMonAn INT,
    @soLuongMoi INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @soLuongCu INT;
    DECLARE @errorMessage NVARCHAR(4000);
    DECLARE @rowsAffected INT = 0;

    -- Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy số lượng hiện tại của món ăn trong hóa đơn
        SELECT @soLuongCu = soLuong
        FROM ChiTietHoaDonBan
        WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;

        IF @soLuongCu IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50001, 'Món ăn không tồn tại trong hóa đơn.', 1;
            RETURN;
        END

        -- Tính số lượng nguyên liệu cần thay đổi (tăng hoặc giảm)
        DECLARE @soLuongThayDoi FLOAT = @soLuongMoi - @soLuongCu;

        -- Kiểm tra số lượng nguyên liệu trong kho nếu tăng số lượng
        IF @soLuongThayDoi > 0
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM CongThucMonAn ctm
                JOIN KhoNguyenLieu knl ON ctm.idNguyenLieu = knl.id
                WHERE ctm.idMonAn = @idMonAn
                AND knl.soLuongTon < (ctm.soLuong * @soLuongThayDoi)
            )
            BEGIN
                -- Lấy thông tin nguyên liệu không đủ
                SELECT TOP 1 @errorMessage = 'Không đủ nguyên liệu trong kho: ' + knl.tenNguyenLieu + 
                                             ' (Cần: ' + CAST((ctm.soLuong * @soLuongThayDoi) AS NVARCHAR) + ' ' + ctm.donViTinh + 
                                             ', Tồn: ' + CAST(knl.soLuongTon AS NVARCHAR) + ' ' + ctm.donViTinh + ')'
                FROM CongThucMonAn ctm
                JOIN KhoNguyenLieu knl ON ctm.idNguyenLieu = knl.id
                WHERE ctm.idMonAn = @idMonAn
                AND knl.soLuongTon < (ctm.soLuong * @soLuongThayDoi);

                ROLLBACK TRANSACTION;
                THROW 50002, @errorMessage, 1;
                RETURN;
            END;
        END

        -- Cập nhật số lượng nguyên liệu trong kho
        UPDATE knl
        SET knl.soLuongTon = knl.soLuongTon - (ctm.soLuong * @soLuongThayDoi)
        FROM KhoNguyenLieu knl
        JOIN CongThucMonAn ctm ON knl.id = ctm.idNguyenLieu
        WHERE ctm.idMonAn = @idMonAn;
        SET @rowsAffected = @rowsAffected + @@ROWCOUNT;

        -- Cập nhật số lượng món ăn trong ChiTietHoaDonBan
        UPDATE ChiTietHoaDonBan
        SET soLuong = @soLuongMoi
        WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;
        SET @rowsAffected = @rowsAffected + @@ROWCOUNT;

        COMMIT TRANSACTION;

        -- Trả về số dòng bị ảnh hưởng
        SELECT @rowsAffected AS RowsAffected;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @errorMessage = ERROR_MESSAGE();
        THROW 50000, @errorMessage, 1;
    END CATCH
END

CREATE PROCEDURE [dbo].[sp_XoaMonAnKhoiHoaDon]
    @idHoaDonBan INT,
    @idMonAn INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @soLuong INT;
    DECLARE @errorMessage NVARCHAR(4000);
    DECLARE @rowsAffected INT = 0;

    -- Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Lấy số lượng món ăn trong hóa đơn
        SELECT @soLuong = soLuong
        FROM ChiTietHoaDonBan
        WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;

        IF @soLuong IS NULL
        BEGIN
            ROLLBACK TRANSACTION;
            THROW 50001, 'Món ăn không tồn tại trong hóa đơn.', 1;
            RETURN;
        END

        -- Hoàn lại số lượng nguyên liệu trong kho
        UPDATE knl
        SET knl.soLuongTon = knl.soLuongTon + (ctm.soLuong * @soLuong)
        FROM KhoNguyenLieu knl
        JOIN CongThucMonAn ctm ON knl.id = ctm.idNguyenLieu
        WHERE ctm.idMonAn = @idMonAn;
        SET @rowsAffected = @rowsAffected + @@ROWCOUNT;

        -- Xóa món ăn khỏi ChiTietHoaDonBan
        DELETE FROM ChiTietHoaDonBan
        WHERE idHoaDonBan = @idHoaDonBan AND idMonAn = @idMonAn;
        SET @rowsAffected = @rowsAffected + @@ROWCOUNT;

        -- Kiểm tra xem hóa đơn còn món nào không, nếu không thì xóa hóa đơn và cập nhật trạng thái bàn
        IF NOT EXISTS (SELECT 1 FROM ChiTietHoaDonBan WHERE idHoaDonBan = @idHoaDonBan)
        BEGIN
            DELETE FROM HoaDonBan WHERE id = @idHoaDonBan;
            UPDATE Ban SET trangThai = N'Trống' WHERE id = (SELECT idBanAn FROM HoaDonBan WHERE id = @idHoaDonBan);
            SET @rowsAffected = @rowsAffected + @@ROWCOUNT;
        END

        COMMIT TRANSACTION;

        -- Trả về số dòng bị ảnh hưởng
        SELECT @rowsAffected AS RowsAffected;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @errorMessage = ERROR_MESSAGE();
        THROW 50000, @errorMessage, 1;
    END CATCH
END

CREATE PROCEDURE sp_ThongKeMonAnBanDuocTheoThoiGian
    @tuNgay DATE = NULL,
    @denNgay DATE = NULL
AS
BEGIN
    SELECT 
        ma.id AS IdMonAn,
        ma.tenMonAn AS TenMonAn,
        dm.tenDanhMuc AS TenDanhMuc,
        SUM(cthd.soLuong) AS TongSoLuong,
        SUM(cthd.soLuong * ma.giaTien) AS TongDoanhThu
    FROM MonAn ma
    JOIN ChiTietHoaDonBan cthd ON ma.id = cthd.idMonAn
    JOIN DanhMucMonAn dm ON ma.idDanhMuc = dm.id
    JOIN HoaDonBan hd ON cthd.idHoaDonBan = hd.id
    WHERE hd.trangThaiHD = 1 -- Chỉ lấy hóa đơn đã thanh toán
        AND (@tuNgay IS NULL OR hd.thoiDiemRa >= @tuNgay)
        AND (@denNgay IS NULL OR hd.thoiDiemRa <= @denNgay)
    GROUP BY ma.id, ma.tenMonAn, dm.tenDanhMuc
    ORDER BY TongSoLuong DESC;
END;

Select * from Ban
Select * from MonAn
select * from CongThucMonAn
select * from DanhMucMonAn
select * from HoaDonBan
Select * from ChiTietHoaDonBan
select * from TaiKhoan
select * from NhanVien
SELECT * FROM NhaCungCap;
SELECT * FROM KhoNguyenLieu;
SELECT * FROM HoaDonNhap;
SELECT * FROM ChiTietHoaDonNhap;
SELECT * FROM BaoCaoDoanhThu

CREATE PROCEDURE sp_LayChiTietHoaDonTheoBan
    @idBan INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        cthd.idHoaDonBan,
        cthd.idMonAn,
        ma.idDanhMuc,
        ma.tenMonAn,
        dm.tenDanhMuc,
        ma.giaTien,
        cthd.soLuong,
        (cthd.soLuong * ma.giaTien) AS ThanhTien
    FROM HoaDonBan hd
    JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    JOIN MonAn ma ON cthd.idMonAn = ma.id
    JOIN DanhMucMonAn dm ON ma.idDanhMuc = dm.id
    WHERE hd.idBanAn = @idBan AND hd.trangThaiHD = 0
END

CREATE PROCEDURE sp_LayChiTietHoaDonTheoIdHoaDon
    @idHoaDonBan INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        cthd.idHoaDonBan,
        ma.tenMonAn,
        dm.tenDanhMuc,
        ma.giaTien,
        cthd.soLuong,
        (cthd.soLuong * ma.giaTien) AS ThanhTien
    FROM ChiTietHoaDonBan cthd
    JOIN MonAn ma ON cthd.idMonAn = ma.id
    JOIN DanhMucMonAn dm ON ma.idDanhMuc = dm.id
    WHERE cthd.idHoaDonBan = @idHoaDonBan
END

CREATE PROCEDURE sp_KiemTraMonAnTonTai
    @idBan INT,
    @idMonAn INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*)
    FROM HoaDonBan hd
    JOIN ChiTietHoaDonBan cthd ON hd.id = cthd.idHoaDonBan
    WHERE hd.idBanAn = @idBan AND cthd.idMonAn = @idMonAn
END