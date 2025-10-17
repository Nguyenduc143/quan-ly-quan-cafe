﻿using System;
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

            string sql = @"
            SELECT TOP 5 
                m.id AS IdMonAn,
                m.tenMonAn AS TenMonAn,
                SUM(ct.soLuong) as TongSoLuongBan,
                m.giaTien AS GiaBan,
                SUM(ct.soLuong * m.giaTien) as TongDoanhThu
            FROM ChiTietHoaDonBan ct
            INNER JOIN MonAn m ON ct.idMonAn = m.id
            INNER JOIN HoaDonBan h ON ct.idHoaDonBan = h.id
            WHERE h.trangThaiHD = 1";

            var parameters = new List<SqlParameter>();

            if (tuNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao >= @TuNgay";
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            }

            if (denNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao <= @DenNgay";
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));
            }

            sql += @"
            GROUP BY m.id, m.tenMonAn, m.giaTien
            ORDER BY TongSoLuongBan DESC";

            var dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());

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
            string sql = @"
            SELECT 
                ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongDoanhThu,
                COUNT(DISTINCT h.id) as SoDonHang
            FROM HoaDonBan h
            INNER JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
            INNER JOIN MonAn m ON ct.idMonAn = m.id
            WHERE h.trangThaiHD = 1";

            var parameters = new List<SqlParameter>();

            if (tuNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao >= @TuNgay";
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            }

            if (denNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao <= @DenNgay";
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));
            }

            var dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());

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
            string sql = @"
            SELECT 
                ISNULL(SUM(ct.soLuong), 0) as TongSoLuongDaBan,
                COUNT(DISTINCT ct.idMonAn) as SoLoaiMonAn
            FROM ChiTietHoaDonBan ct
            INNER JOIN HoaDonBan h ON ct.idHoaDonBan = h.id
            WHERE h.trangThaiHD = 1";

            var parameters = new List<SqlParameter>();

            if (tuNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao >= @TuNgay";
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            }

            if (denNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao <= @DenNgay";
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));
            }

            var dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());

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
            string sql = @"
            SELECT 
                COUNT(DISTINCT h.id) as TongSoDonHang,
                ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongDoanhThu
            FROM HoaDonBan h
            INNER JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
            INNER JOIN MonAn m ON ct.idMonAn = m.id
            WHERE h.trangThaiHD = 1";

            var parameters = new List<SqlParameter>();

            if (tuNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao >= @TuNgay";
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            }

            if (denNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao <= @DenNgay";
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));
            }

            var dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());

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

            string sql = @"
            SELECT 
                h.id as IdHoaDonBan,
                h.thoiDiemVao as NgayBan,
                CASE h.trangThaiHD 
                    WHEN 0 THEN N'Chưa thanh toán'
                    WHEN 1 THEN N'Đã thanh toán'
                    ELSE N'Không xác định'
                END as TrangThai,
                ISNULL(SUM(ct.soLuong * m.giaTien), 0) as TongTien,
                b.tenBan as TenBan,
                nv.hoTen as TenNhanVien
            FROM HoaDonBan h
            INNER JOIN Ban b ON h.idBanAn = b.id
            LEFT JOIN NhanVien nv ON h.idNhanVien = nv.id
            LEFT JOIN ChiTietHoaDonBan ct ON h.id = ct.idHoaDonBan
            LEFT JOIN MonAn m ON ct.idMonAn = m.id
            WHERE 1=1";

            var parameters = new List<SqlParameter>();

            if (tuNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao >= @TuNgay";
                parameters.Add(new SqlParameter("@TuNgay", tuNgay.Value));
            }

            if (denNgay.HasValue)
            {
                sql += " AND h.thoiDiemVao <= @DenNgay";
                parameters.Add(new SqlParameter("@DenNgay", denNgay.Value));
            }

            sql += @"
            GROUP BY h.id, h.thoiDiemVao, h.trangThaiHD, b.tenBan, nv.hoTen
            ORDER BY h.thoiDiemVao DESC";

            var dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());

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