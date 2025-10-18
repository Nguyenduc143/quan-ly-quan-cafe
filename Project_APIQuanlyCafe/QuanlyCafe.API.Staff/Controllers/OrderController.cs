using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;
using System.Collections.Generic;

namespace QuanlyCafe.API.Staff.Controllers
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
        public ActionResult<List<OrderModel>> GetAllOrders()
        {
            return Ok(_orderBll.GetAllOrders());
        }

        /// <summary>
        /// Lấy chi tiết đơn hàng theo ID
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Chi tiết đơn hàng</returns>
        [HttpGet("{id}")]
        public ActionResult<OrderModel> GetOrderById(int id)
        {
            var order = _orderBll.GetOrderById(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        /// <summary>
        /// Tạo đơn hàng mới
        /// </summary>
        /// <param name="request">Thông tin đơn hàng mới</param>
        /// <returns>ID của đơn hàng được tạo</returns>
        [HttpPost]
        public ActionResult<int> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var id = _orderBll.CreateOrder(request);
            return Ok(id);
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
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = _orderBll.UpdateOrder(id, request);
            if (!result) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Xóa đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            var result = _orderBll.DeleteOrder(id);
            if (!result) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Thay đổi trạng thái đơn hàng
        /// </summary>
        /// <param name="id">ID của đơn hàng</param>
        /// <param name="request">Thông tin trạng thái mới</param>
        /// <returns>Kết quả cập nhật trạng thái</returns>
        [HttpPatch("{id}/status")]
        public IActionResult UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = _orderBll.UpdateOrderStatus(id, request);
            if (!result) return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Lấy đơn hàng theo bàn
        /// </summary>
        /// <param name="tableId">ID của bàn</param>
        /// <returns>Danh sách đơn hàng của bàn</returns>
        [HttpGet("table/{tableId}")]
        public ActionResult<List<OrderModel>> GetOrdersByTableId(int tableId)
        {
            return Ok(_orderBll.GetOrdersByTableId(tableId));
        }
    }
}
