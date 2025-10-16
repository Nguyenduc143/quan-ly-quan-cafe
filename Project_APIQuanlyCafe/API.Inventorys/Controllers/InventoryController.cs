using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;

namespace API.Inventorys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly InventoryBLL _inventoryBLL;

        public InventoryController(InventoryBLL inventoryBLL)
        {
            _inventoryBLL = inventoryBLL;
        }

        // GET: api/inventory - Lấy danh sách nguyên liệu
        [HttpGet]
        public IActionResult GetAllInventory()
        {
            try
            {
                var inventoryList = _inventoryBLL.GetAllInventory();
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách nguyên liệu thành công",
                    data = inventoryList
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // GET: api/inventory/{id} - Lấy thông tin nguyên liệu theo ID
        [HttpGet("{id}")]
        public IActionResult GetInventoryById(int id)
        {
            try
            {
                var inventory = _inventoryBLL.GetInventoryById(id);
                if (inventory == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Không tìm thấy nguyên liệu"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Lấy thông tin nguyên liệu thành công",
                    data = inventory
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // POST: api/inventory - Thêm nguyên liệu
        [HttpPost]
        public IActionResult CreateInventory([FromBody] CreateInventoryRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ"
                    });
                }

                var newId = _inventoryBLL.CreateInventory(request);
                return Ok(new
                {
                    success = true,
                    message = "Thêm nguyên liệu thành công",
                    data = new { id = newId }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // PUT: api/inventory/{id} - Cập nhật thông tin nguyên liệu
        [HttpPut("{id}")]
        public IActionResult UpdateInventory(int id, [FromBody] UpdateInventoryRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Dữ liệu không hợp lệ"
                    });
                }

                var result = _inventoryBLL.UpdateInventory(id, request);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Cập nhật thất bại"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật nguyên liệu thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // DELETE: api/inventory/{id} - Xóa nguyên liệu
        [HttpDelete("{id}")]
        public IActionResult DeleteInventory(int id)
        {
            try
            {
                var result = _inventoryBLL.DeleteInventory(id);
                if (!result)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Xóa thất bại"
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Xóa nguyên liệu thành công"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}
