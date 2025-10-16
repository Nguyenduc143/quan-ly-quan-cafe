using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;

namespace API.Inventorys.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly InventoryBLL _inventoryBLL;

        public SuppliersController(InventoryBLL inventoryBLL)
        {
            _inventoryBLL = inventoryBLL;
        }

        // GET: api/suppliers - L?y danh sách nhà cung cap
        [HttpGet]
        public IActionResult GetAllSuppliers()
        {
            try
            {
                var supplierList = _inventoryBLL.GetAllSuppliers();
                return Ok(new
                {
                    success = true,
                    message = "L?y danh sách nhà cung c?p thành công",
                    data = supplierList
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

        // POST: api/suppliers - Thêm nhà cung cap
        [HttpPost]
        public IActionResult CreateSupplier([FromBody] CreateSupplierRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "D? li?u không h?p l?"
                    });
                }

                var newId = _inventoryBLL.CreateSupplier(request);
                return Ok(new
                {
                    success = true,
                    message = "Thêm nhà cung c?p thành công",
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
    }
}