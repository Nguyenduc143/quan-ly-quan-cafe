﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Models;
using DAL;

namespace BLL
{
    public class ReportsBLL
    {
        private readonly ReportsDAL _reportsDAL;

        public ReportsBLL(ReportsDAL reportsDAL)
        {
            _reportsDAL = reportsDAL;
        }

        // Lấy top 5 sản phẩm bán chạy nhất
        public async Task<List<TopSellingProductModel>> GetTop5BestSellingProductsAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetTop5BestSellingProducts(tuNgay, denNgay);
            });
        }

        // Lấy tổng doanh thu
        public async Task<RevenueReportModel> GetTotalRevenueAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetTotalRevenue(tuNgay, denNgay);
            });
        }

        // Lấy tổng số lượng sản phẩm đã bán
        public async Task<SalesQuantityModel> GetTotalProductsSoldAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetTotalProductsSold(tuNgay, denNgay);
            });
        }

        // Lấy trung bình giá trị đơn hàng
        public async Task<AverageOrderValueModel> GetAverageOrderValueAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetAverageOrderValue(tuNgay, denNgay);
            });
        }

        // Lấy danh sách tổng hợp đơn hàng
        public async Task<List<OrderSummaryModel>> GetOrdersSummaryAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetOrdersSummary(tuNgay, denNgay);
            });
        }

        // Lấy báo cáo tổng hợp cho dashboard
        public async Task<DashboardReportModel> GetDashboardReportAsync(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            return await Task.Run(() =>
            {
                ValidateDateRange(tuNgay, denNgay);
                return _reportsDAL.GetDashboardReport(tuNgay, denNgay);
            });
        }

        // Phiên bản đồng bộ
        public List<TopSellingProductModel> GetTop5BestSellingProducts(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetTop5BestSellingProducts(tuNgay, denNgay);
        }

        public RevenueReportModel GetTotalRevenue(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetTotalRevenue(tuNgay, denNgay);
        }

        public SalesQuantityModel GetTotalProductsSold(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetTotalProductsSold(tuNgay, denNgay);
        }

        public AverageOrderValueModel GetAverageOrderValue(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetAverageOrderValue(tuNgay, denNgay);
        }

        public List<OrderSummaryModel> GetOrdersSummary(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetOrdersSummary(tuNgay, denNgay);
        }

        public DashboardReportModel GetDashboardReport(DateTime? tuNgay = null, DateTime? denNgay = null)
        {
            ValidateDateRange(tuNgay, denNgay);
            return _reportsDAL.GetDashboardReport(tuNgay, denNgay);
        }

        // Validate khoảng thời gian
        private void ValidateDateRange(DateTime? tuNgay, DateTime? denNgay)
        {
            if (tuNgay.HasValue && denNgay.HasValue)
            {
                if (tuNgay.Value > denNgay.Value)
                {
                    throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc");
                }

                // Không cho phép khoảng thời gian quá dài (ví dụ: > 1 năm)
                if ((denNgay.Value - tuNgay.Value).TotalDays > 365)
                {
                    throw new ArgumentException("Khoảng thời gian báo cáo không được vượt quá 1 năm");
                }
            }

            // Cho phép ngày trong tương lai, chỉ kiểm tra logic ngày bắt đầu <= ngày kết thúc và khoảng thời gian hợp lệ
            // ĐÃ BỎ kiểm tra ngày trong tương lai
        }
    }
}
