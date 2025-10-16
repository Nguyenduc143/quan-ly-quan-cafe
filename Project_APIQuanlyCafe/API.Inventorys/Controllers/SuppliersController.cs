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

        // GET: api/suppliers - L?y danh s�ch nh� cung cap
        [HttpGet]
        public IActionResult GetAllSuppliers()
        {
            try
            {
                var supplierList = _inventoryBLL.GetAllSuppliers();
                return Ok(new
                {
                    success = true,
                    message = "L?y danh s�ch nh� cung c?p th�nh c�ng",
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

        // POST: api/suppliers - Th�m nh� cung cap
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
                        message = "D? li?u kh�ng h?p l?"
                    });
                }

                var newId = _inventoryBLL.CreateSupplier(request);
                return Ok(new
                {
                    success = true,
                    message = "Th�m nh� cung c?p th�nh c�ng",
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