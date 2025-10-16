using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;

namespace API.Orders.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly OrderBLL _orderBLL;
        
        public OrderController(IConfiguration configuration)
        {
            _orderBLL = new OrderBLL(configuration);
        }
        
        /// <summary>
        /// Lấy danh sách tất cả đơn hàng
        /// </summary>
        /// <returns>Danh sách đơn hàng</returns>
        [HttpGet]
        public IActionResult GetAllOrders()
        {
            try
            {
                var orders = _orderBLL.GetAllOrders();
                return Ok(new
                {
                    Success = true,
                    Message = "Lấy danh sách đơn hàng thành công",
                    Data = orders
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Lấy chi tiết đơn hàng theo ID
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Chi tiết đơn hàng</returns>
        [HttpGet("{id}")]
        public IActionResult GetOrderById(int id)
        {
            try
            {
                var order = _orderBLL.GetOrderById(id);
                return Ok(new
                {
                    Success = true,
                    Message = "Lấy chi tiết đơn hàng thành công",
                    Data = order
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Tạo đơn hàng mới
        /// </summary>
        /// <param name="request">Thông tin đơn hàng mới</param>
        /// <returns>ID của đơn hàng được tạo</returns>
        [HttpPost]
        public IActionResult CreateOrder([FromBody] CreateOrderRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Dữ liệu không hợp lệ",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }
                
                var orderId = _orderBLL.CreateOrder(request);
                return Ok(new
                {
                    Success = true,
                    Message = "Tạo đơn hàng thành công",
                    Data = new { Id = orderId }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Cập nhật đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <param name="request">Thông tin cập nhật</param>
        /// <returns>Kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public IActionResult UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Dữ liệu không hợp lệ",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }
                
                var result = _orderBLL.UpdateOrder(id, request);
                return Ok(new
                {
                    Success = result,
                    Message = result ? "Cập nhật đơn hàng thành công" : "Cập nhật đơn hàng thất bại"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Xóa đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            try
            {
                var result = _orderBLL.DeleteOrder(id);
                return Ok(new
                {
                    Success = result,
                    Message = result ? "Xóa đơn hàng thành công" : "Xóa đơn hàng thất bại"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Thay đổi trạng thái đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <param name="request">Thông tin trạng thái mới</param>
        /// <returns>Kết quả cập nhật trạng thái</returns>
        [HttpPut("{id}/status")]
        public IActionResult UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        Success = false,
                        Message = "Dữ liệu không hợp lệ",
                        Errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))
                    });
                }
                
                var result = _orderBLL.UpdateOrderStatus(id, request);
                return Ok(new
                {
                    Success = result,
                    Message = result ? "Cập nhật trạng thái đơn hàng thành công" : "Cập nhật trạng thái đơn hàng thất bại"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
        
        /// <summary>
        /// Lấy đơn hàng theo bàn
        /// </summary>
        /// <param name="tableId">ID của bàn</param>
        /// <returns>Danh sách đơn hàng của bàn</returns>
        [HttpGet("table/{tableId}")]
        public IActionResult GetOrdersByTableId(int tableId)
        {
            try
            {
                var orders = _orderBLL.GetOrdersByTableId(tableId);
                return Ok(new
                {
                    Success = true,
                    Message = "Lấy danh sách đơn hàng theo bàn thành công",
                    Data = orders
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
}
