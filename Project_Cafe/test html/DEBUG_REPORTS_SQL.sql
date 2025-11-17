-- ============================================
-- KIỂM TRA DỮ LIỆU BÁO CÁO
-- ============================================

-- 1. Kiểm tra số đơn hàng đã thanh toán hôm nay
SELECT 
    COUNT(*) as SoDonDaThanhToan,
    SUM(
        ISNULL((
            SELECT SUM(ct.SoLuong * m.GIATIEN) 
            FROM ChiTietHoaDonBan ct
            INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
            WHERE ct.IDHoaDonBan = hdb.ID
        ), 0)
    ) as TongDoanhThu
FROM HoaDonBan hdb
WHERE hdb.TrangThaiHD = 1  -- ĐÃ THANH TOÁN
  AND CAST(hdb.ThoiDiemVao AS DATE) = CAST(GETDATE() AS DATE);

-- 2. Xem chi tiết các đơn hàng hôm nay
SELECT 
    hdb.ID as MaDon,
    hdb.TrangThaiHD,
    CASE 
        WHEN hdb.TrangThaiHD = 0 THEN 'Chưa thanh toán'
        WHEN hdb.TrangThaiHD = 1 THEN 'Đã thanh toán'
        ELSE 'Không xác định'
    END as TrangThai,
    hdb.ThoiDiemVao,
    hdb.ThoiDiemRa,
    (
        SELECT SUM(ct.SoLuong * m.GIATIEN) 
        FROM ChiTietHoaDonBan ct
        INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
        WHERE ct.IDHoaDonBan = hdb.ID
    ) as TongTien
FROM HoaDonBan hdb
WHERE CAST(hdb.ThoiDiemVao AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY hdb.ThoiDiemVao DESC;

-- 3. Kiểm tra Stored Procedure sp_GetTotalRevenue
-- Chạy SP thủ công
DECLARE @TuNgay DATETIME = CAST(GETDATE() AS DATE);
DECLARE @DenNgay DATETIME = DATEADD(DAY, 1, CAST(GETDATE() AS DATE));

EXEC sp_GetTotalRevenue @TuNgay, @DenNgay;

-- 4. Kiểm tra nội dung SP (nếu có quyền)
-- sp_helptext sp_GetTotalRevenue;
-- sp_helptext sp_GetTotalProductsSold;
-- sp_helptext sp_GetAverageOrderValue;
-- sp_helptext sp_GetTop5BestSellingProducts;
-- sp_helptext sp_GetOrdersSummary;

-- 5. Query thủ công thay cho SP (để so sánh)
SELECT 
    SUM(ct.SoLuong * m.GIATIEN) as TongDoanhThu,
    COUNT(DISTINCT hdb.ID) as SoDonHang
FROM HoaDonBan hdb
INNER JOIN ChiTietHoaDonBan ct ON hdb.ID = ct.IDHoaDonBan
INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
WHERE hdb.TrangThaiHD = 1  -- ✅ CHỈ TÍNH ĐƠN ĐÃ THANH TOÁN
  AND hdb.ThoiDiemVao >= CAST(GETDATE() AS DATE)
  AND hdb.ThoiDiemVao < DATEADD(DAY, 1, CAST(GETDATE() AS DATE));

-- 6. Kiểm tra tổng số lượng bán
SELECT 
    SUM(ct.SoLuong) as TongSoLuongBan,
    COUNT(DISTINCT m.IDMONAN) as SoLoaiMonAn
FROM HoaDonBan hdb
INNER JOIN ChiTietHoaDonBan ct ON hdb.ID = ct.IDHoaDonBan
INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
WHERE hdb.TrangThaiHD = 1
  AND hdb.ThoiDiemVao >= CAST(GETDATE() AS DATE)
  AND hdb.ThoiDiemVao < DATEADD(DAY, 1, CAST(GETDATE() AS DATE));

-- 7. Kiểm tra Top 5 sản phẩm bán chạy
SELECT TOP 5
    m.IDMONAN as IdMonAn,
    m.TENMONAN as TenMonAn,
    SUM(ct.SoLuong) as TongSoLuongBan,
    m.GIATIEN as GiaBan,
    SUM(ct.SoLuong * m.GIATIEN) as TongDoanhThu
FROM HoaDonBan hdb
INNER JOIN ChiTietHoaDonBan ct ON hdb.ID = ct.IDHoaDonBan
INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
WHERE hdb.TrangThaiHD = 1
  AND hdb.ThoiDiemVao >= CAST(GETDATE() AS DATE)
  AND hdb.ThoiDiemVao < DATEADD(DAY, 1, CAST(GETDATE() AS DATE))
GROUP BY m.IDMONAN, m.TENMONAN, m.GIATIEN
ORDER BY TongSoLuongBan DESC;

-- 8. So sánh đơn chưa thanh toán vs đã thanh toán
SELECT 
    TrangThaiHD,
    CASE 
        WHEN TrangThaiHD = 0 THEN 'Chưa thanh toán'
        WHEN TrangThaiHD = 1 THEN 'Đã thanh toán'
    END as TenTrangThai,
    COUNT(*) as SoDon,
    SUM(
        ISNULL((
            SELECT SUM(ct.SoLuong * m.GIATIEN) 
            FROM ChiTietHoaDonBan ct
            INNER JOIN MONAN m ON ct.IDMonAn = m.IDMONAN
            WHERE ct.IDHoaDonBan = hdb.ID
        ), 0)
    ) as TongTien
FROM HoaDonBan hdb
WHERE CAST(hdb.ThoiDiemVao AS DATE) = CAST(GETDATE() AS DATE)
GROUP BY TrangThaiHD
ORDER BY TrangThaiHD;

-- ============================================
-- KẾT LUẬN
-- ============================================
-- Nếu query #5 trả về dữ liệu ĐÚNG nhưng SP không đúng
--   → Cần sửa lại Stored Procedure
--
-- Nếu query #5 trả về 0 hoặc NULL
--   → Kiểm tra TrangThaiHD có được cập nhật khi thanh toán không
--
-- Nếu query #8 cho thấy có đơn TrangThaiHD = 1
--   → Backend hoạt động đúng, vấn đề ở frontend hoặc caching
-- ============================================
