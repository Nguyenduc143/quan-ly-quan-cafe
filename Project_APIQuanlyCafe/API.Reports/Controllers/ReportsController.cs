using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;
using DAL;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportsBLL _reportsBLL;

        public ReportsController(ReportsBLL reportsBLL)
        {
            _reportsBLL = reportsBLL;
        }

        /// <summary>
        /// Lấy top 5 sản phẩm bán chạy nhất
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Danh sách top 5 sản phẩm bán chạy nhất</returns>
        [HttpGet("top-selling-products")]
        public async Task<ActionResult<List<TopSellingProductModel>>> GetTop5BestSellingProducts(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetTop5BestSellingProductsAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tổng doanh thu
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Thông tin tổng doanh thu</returns>
        [HttpGet("total-revenue")]
        public async Task<ActionResult<RevenueReportModel>> GetTotalRevenue(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetTotalRevenueAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tổng số lượng sản phẩm đã bán
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Thông tin số lượng sản phẩm đã bán</returns>
        [HttpGet("total-products-sold")]
        public async Task<ActionResult<SalesQuantityModel>> GetTotalProductsSold(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetTotalProductsSoldAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy trung bình giá trị đơn hàng
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Thông tin trung bình giá trị đơn hàng</returns>
        [HttpGet("average-order-value")]
        public async Task<ActionResult<AverageOrderValueModel>> GetAverageOrderValue(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetAverageOrderValueAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy danh sách tổng hợp đơn hàng để xuất báo cáo
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Danh sách thông tin đơn hàng</returns>
        [HttpGet("orders-summary")]
        public async Task<ActionResult<List<OrderSummaryModel>>> GetOrdersSummary(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetOrdersSummaryAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy báo cáo tổng hợp cho dashboard
        /// </summary>
        /// <param name="tuNgay">Ngày bắt đầu (tùy chọn)</param>
        /// <param name="denNgay">Ngày kết thúc (tùy chọn)</param>
        /// <returns>Báo cáo tổng hợp</returns>
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardReportModel>> GetDashboardReport(
            [FromQuery] DateTime? tuNgay = null,
            [FromQuery] DateTime? denNgay = null)
        {
            try
            {
                var result = await _reportsBLL.GetDashboardReportAsync(tuNgay, denNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy báo cáo theo ngày cụ thể
        /// </summary>
        /// <param name="request">Thông tin khoảng thời gian</param>
        /// <returns>Báo cáo tổng hợp</returns>
        [HttpPost("date-range")]
        public async Task<ActionResult<DashboardReportModel>> GetReportByDateRange([FromBody] ReportDateRangeRequest request)
        {
            try
            {
                var result = await _reportsBLL.GetDashboardReportAsync(request.TuNgay, request.DenNgay);
                return Ok(new
                {
                    success = true,
                    message = "Lấy dữ liệu thành công",
                    data = result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server", error = ex.Message });
            }
        }
    }
}
