using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using Models;

namespace DAL
{
    public class ReportsDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public ReportsDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Lấy top 5 sản phẩm bán chạy nhất
        public List<TopSellingProductModel> GetTop5BestSellingProducts(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var products = new List<TopSellingProductModel>();

            var parameters = new List<SqlParameter>();
            if (tuNgay.HasValue)
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            if (denNgay.HasValue)
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));

            var dt = _dbHelper.ExecuteStoredProcedure("sp_GetTop5BestSellingProducts", parameters.ToArray());

            foreach (DataRow row in dt.Rows)
            {
                products.Add(new TopSellingProductModel
                {
                    IdMonAn = Convert.ToInt32(row["IdMonAn"]),
                    TenMonAn = row["TenMonAn"].ToString() ?? string.Empty,
                    TongSoLuongBan = Convert.ToInt32(row["TongSoLuongBan"]),
                    GiaBan = Convert.ToDecimal(row["GiaBan"]),
                    TongDoanhThu = Convert.ToDecimal(row["TongDoanhThu"])
                });
            }

            return products;
        }

        // Lấy tổng doanh thu
        public RevenueReportModel GetTotalRevenue(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var parameters = new List<SqlParameter>();
            if (tuNgay.HasValue)
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            if (denNgay.HasValue)
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));

            var dt = _dbHelper.ExecuteStoredProcedure("sp_GetTotalRevenue", parameters.ToArray());

            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                return new RevenueReportModel
                {
                    TongDoanhThu = Convert.ToDecimal(row["TongDoanhThu"]),
                    SoDonHang = Convert.ToInt32(row["SoDonHang"]),
                    TuNgay = tuNgay,
                    DenNgay = denNgay
                };
            }

            return new RevenueReportModel { TuNgay = tuNgay, DenNgay = denNgay };
        }

        // Lấy tổng số lượng sản phẩm đã bán
        public SalesQuantityModel GetTotalProductsSold(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var parameters = new List<SqlParameter>();
            if (tuNgay.HasValue)
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            if (denNgay.HasValue)
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));

            var dt = _dbHelper.ExecuteStoredProcedure("sp_GetTotalProductsSold", parameters.ToArray());

            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                return new SalesQuantityModel
                {
                    TongSoLuongDaBan = Convert.ToInt32(row["TongSoLuongDaBan"]),
                    SoLoaiMonAn = Convert.ToInt32(row["SoLoaiMonAn"]),
                    TuNgay = tuNgay,
                    DenNgay = denNgay
                };
            }

            return new SalesQuantityModel { TuNgay = tuNgay, DenNgay = denNgay };
        }

        // Lấy trung bình giá trị đơn hàng
        public AverageOrderValueModel GetAverageOrderValue(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var parameters = new List<SqlParameter>();
            if (tuNgay.HasValue)
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            if (denNgay.HasValue)
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));

            var dt = _dbHelper.ExecuteStoredProcedure("sp_GetAverageOrderValue", parameters.ToArray());

            if (dt.Rows.Count > 0)
            {
                var row = dt.Rows[0];
                var tongSoDonHang = Convert.ToInt32(row["TongSoDonHang"]);
                var tongDoanhThu = Convert.ToDecimal(row["TongDoanhThu"]);

                return new AverageOrderValueModel
                {
                    TongSoDonHang = tongSoDonHang,
                    TongDoanhThu = tongDoanhThu,
                    TrungBinhGiaTriDonHang = tongSoDonHang > 0 ? tongDoanhThu / tongSoDonHang : 0,
                    TuNgay = tuNgay,
                    DenNgay = denNgay
                };
            }

            return new AverageOrderValueModel { TuNgay = tuNgay, DenNgay = denNgay };
        }

        // Lấy danh sách tổng hợp đơn hàng
        public List<OrderSummaryModel> GetOrdersSummary(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var orders = new List<OrderSummaryModel>();

            var parameters = new List<SqlParameter>();
            if (tuNgay.HasValue)
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            if (denNgay.HasValue)
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));

            var dt = _dbHelper.ExecuteStoredProcedure("sp_GetOrdersSummary", parameters.ToArray());

            foreach (DataRow row in dt.Rows)
            {
                orders.Add(new OrderSummaryModel
                {
                    IdHoaDonBan = Convert.ToInt32(row["IdHoaDonBan"]),
                    NgayBan = Convert.ToDateTime(row["NgayBan"]),
                    TrangThai = row["TrangThai"].ToString() ?? string.Empty,
                    TongTien = Convert.ToDecimal(row["TongTien"]),
                    TenBan = row["TenBan"].ToString() ?? string.Empty,
                    TenNhanVien = row["TenNhanVien"]?.ToString()
                });
            }

            return orders;
        }

        // Lấy báo cáo tổng hợp cho dashboard
        public DashboardReportModel GetDashboardReport(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            var revenueReport = GetTotalRevenue(tuNgay, denNgay);
            var salesQuantity = GetTotalProductsSold(tuNgay, denNgay);
            var averageOrder = GetAverageOrderValue(tuNgay, denNgay);
            var topProducts = GetTop5BestSellingProducts(tuNgay, denNgay);

            return new DashboardReportModel
            {
                TongDoanhThu = revenueReport.TongDoanhThu,
                TongSoDonHang = revenueReport.SoDonHang,
                TongSoLuongBan = salesQuantity.TongSoLuongDaBan,
                TrungBinhDonHang = averageOrder.TrungBinhGiaTriDonHang,
                Top5SanPhamBanChay = topProducts
            };
        }
    }
}

