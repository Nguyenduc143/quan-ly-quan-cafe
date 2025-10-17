using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    // Model cho top 5 sản phẩm bán chạy nhất
    public class TopSellingProductModel
    {
        public int IdMonAn { get; set; }
        public string TenMonAn { get; set; } = string.Empty;
        public int TongSoLuongBan { get; set; }
        public decimal GiaBan { get; set; }
        public decimal TongDoanhThu { get; set; }
    }

    // Model cho tổng doanh thu
    public class RevenueReportModel
    {
        public decimal TongDoanhThu { get; set; }
        public int SoDonHang { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
    }

    // Model cho số lượng sản phẩm đã bán
    public class SalesQuantityModel
    {
        public int TongSoLuongDaBan { get; set; }
        public int SoLoaiMonAn { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
    }

    // Model cho trung bình giá trị đơn hàng
    public class AverageOrderValueModel
    {
        public decimal TrungBinhGiaTriDonHang { get; set; }
        public int TongSoDonHang { get; set; }
        public decimal TongDoanhThu { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
    }

    // Model cho thông tin tổng hợp đơn hàng
    public class OrderSummaryModel
    {
        public int IdHoaDonBan { get; set; }
        public DateTime NgayBan { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public decimal TongTien { get; set; }
        public string TenBan { get; set; } = string.Empty;
        public string? TenNhanVien { get; set; }
    }

    // Model cho request báo cáo theo thời gian
    public class ReportDateRangeRequest
    {
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
    }

    // Model tổng hợp cho dashboard
    public class DashboardReportModel
    {
        public decimal TongDoanhThu { get; set; }
        public int TongSoDonHang { get; set; }
        public int TongSoLuongBan { get; set; }
        public decimal TrungBinhDonHang { get; set; }
        public List<TopSellingProductModel> Top5SanPhamBanChay { get; set; } = new List<TopSellingProductModel>();
    }
}
