using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;
using System.Collections.Generic;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly OrderBLL _orderBll;

        // Inject OrderBLL via DI
        public OrderController(OrderBLL orderBll)
        {
            _orderBll = orderBll;
        }

        /// <summary>
        /// Lấy danh sách tất cả đơn hàng
        /// </summary>
        /// <returns>Danh sách đơn hàng</returns>
        [HttpGet]
        public ActionResult<object> GetAllOrders()
        {
            try
            {
                var orders = _orderBll.GetAllOrders();
                return Ok(new
                {
                    Success = true,
                    Message = "Lấy danh sách đơn hàng thành công",
                    Data = orders,
                    Count = orders.Count
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết đơn hàng theo ID
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Chi tiết đơn hàng</returns>
        [HttpGet("{id}")]
        public ActionResult<object> GetOrderById(int id)
        {
            try
            {
                var order = _orderBll.GetOrderById(id);
                return Ok(new
                {
                    Success = true,
                    Message = "Lấy thông tin đơn hàng thành công",
                    Data = order
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        /// <summary>
        /// Tạo đơn hàng mới
        /// </summary>
        /// <param name="request">Thông tin đơn hàng mới</param>
        /// <returns>ID của đơn hàng được tạo</returns>
        [HttpPost]
        public ActionResult<object> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Dữ liệu đầu vào không hợp lệ",
                    Data = ModelState
                });
            }

            try
            {
                var orderId = _orderBll.CreateOrder(request);
                var orderDetails = _orderBll.GetOrderById(orderId);

                return Ok(new
                {
                    Success = true,
                    Message = "Tạo đơn hàng thành công",
                    Data = orderDetails
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
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
        public ActionResult<object> UpdateOrder(int id, [FromBody] UpdateOrderRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Dữ liệu đầu vào không hợp lệ",
                    Data = ModelState
                });
            }

            try
            {
                var result = _orderBll.UpdateOrder(id, request);
                return Ok(new
                {
                    Success = true,
                    Message = "Cập nhật đơn hàng thành công",
                    Data = (object)null
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = ex.Message,
                        Data = (object)null
                    });
                }

                if (ex.Message.Contains("Không thể cập nhật"))
                {
                    return Conflict(new
                    {
                        Success = false,
                        Message = ex.Message,
                        Data = (object)null
                    });
                }

                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        /// <summary>
        /// Xóa đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public ActionResult<object> DeleteOrder(int id)
        {
            try
            {
                var result = _orderBll.DeleteOrder(id);
                return Ok(new
                {
                    Success = true,
                    Message = "Xóa đơn hàng thành công",
                    Data = (object)null
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = ex.Message,
                        Data = (object)null
                    });
                }

                if (ex.Message.Contains("Không thể xóa"))
                {
                    return Conflict(new
                    {
                        Success = false,
                        Message = ex.Message,
                        Data = (object)null
                    });
                }

                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        /// <summary>
        /// Thay đổi trạng thái đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <param name="request">Thông tin trạng thái mới</param>
        /// <returns>Kết quả cập nhật trạng thái</returns>
        [HttpPatch("{id}/status")]
        public ActionResult<object> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = "Dữ liệu đầu vào không hợp lệ",
                    Data = ModelState
                });
            }

            try
            {
                var result = _orderBll.UpdateOrderStatus(id, request);
                string statusMessage = request.TrangThaiHD == 1 ? "Đã thanh toán" : "Chưa thanh toán";
                
                return Ok(new
                {
                    Success = true,
                    Message = $"Cập nhật trạng thái đơn hàng thành công - {statusMessage}",
                    Data = (object)null
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new
                    {
                        Success = false,
                        Message = ex.Message,
                        Data = (object)null
                    });
                }

                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }

        /// <summary>
        /// Lấy đơn hàng theo bàn
        /// </summary>
        /// <param name="tableId">ID của bàn</param>
        /// <returns>Danh sách đơn hàng của bàn</returns>
        [HttpGet("table/{tableId}")]
        public ActionResult<object> GetOrdersByTableId(int tableId)
        {
            try
            {
                var orders = _orderBll.GetOrdersByTableId(tableId);
                return Ok(new
                {
                    Success = true,
                    Message = $"Lấy danh sách đơn hàng của bàn {tableId} thành công",
                    Data = orders,
                    Count = orders.Count
                });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message,
                    Data = (object)null
                });
            }
        }
    }
}
