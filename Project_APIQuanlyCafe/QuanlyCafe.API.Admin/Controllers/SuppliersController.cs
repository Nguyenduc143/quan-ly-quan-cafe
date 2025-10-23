using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly SuppliersBLL _suppliersBLL;

        public SuppliersController(SuppliersBLL suppliersBLL)
        {
            _suppliersBLL = suppliersBLL;
        }

        /// <summary>
        /// L?y danh s�ch t?t c? nh� cung c?p
        /// </summary>
        /// <returns>Danh s�ch nh� cung c?p</returns>
        [HttpGet]
        public ActionResult<List<SupplierModel>> GetAllSuppliers()
        {
            try
            {
                var suppliers = _suppliersBLL.GetAllSuppliers();
                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "L?i server", error = ex.Message });
            }
        }

        /// <summary>
        /// L?y th�ng tin chi ti?t nh� cung c?p theo ID
        /// </summary>
        /// <param name="id">ID c?a nh� cung c?p</param>
        /// <returns>Th�ng tin nh� cung c?p</returns>
        [HttpGet("{id}")]
        public ActionResult<SupplierModel> GetSupplierById(int id)
        {
            try
            {
                var supplier = _suppliersBLL.GetSupplierById(id);

                if (supplier == null)
                {
                    return NotFound(new { message = "Kh�ng t�m th?y nh� cung c?p" });
                }

                return Ok(supplier);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "L?i server", error = ex.Message });
            }
        }

        /// <summary>
        /// Th�m nh� cung c?p m?i
        /// </summary>
        /// <param name="supplier">Th�ng tin nh� cung c?p</param>
        /// <returns>Th�ng tin nh� cung c?p ?� t?o</returns>
        [HttpPost]
        public ActionResult<SupplierModel> CreateSupplier([FromBody] SupplierModel supplier)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newSupplierId = _suppliersBLL.CreateSupplier(supplier);
                var createdSupplier = _suppliersBLL.GetSupplierById(newSupplierId);

                return CreatedAtAction(nameof(GetSupplierById), new { id = newSupplierId }, createdSupplier);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "L?i server", error = ex.Message });
            }
        }

        /// <summary>
        /// C?p nh?t th�ng tin nh� cung c?p
        /// </summary>
        /// <param name="id">ID c?a nh� cung c?p</param>
        /// <param name="supplier">Th�ng tin nh� cung c?p c?p nh?t</param>
        /// <returns>Th�ng tin nh� cung c?p ?� c?p nh?t</returns>
        [HttpPut("{id}")]
        public ActionResult<SupplierModel> UpdateSupplier(int id, [FromBody] SupplierModel supplier)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = _suppliersBLL.UpdateSupplier(id, supplier);

                if (!success)
                {
                    return NotFound(new { message = "Kh�ng t�m th?y nh� cung c?p ?? c?p nh?t" });
                }

                var updatedSupplier = _suppliersBLL.GetSupplierById(id);
                return Ok(updatedSupplier);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "L?i server", error = ex.Message });
            }
        }

        /// <summary>
        /// X�a nh� cung c?p
        /// </summary>
        /// <param name="id">ID c?a nh� cung c?p</param>
        /// <returns>K?t qu? x�a</returns>
        [HttpDelete("{id}")]
        public ActionResult DeleteSupplier(int id)
        {
            try
            {
                var success = _suppliersBLL.DeleteSupplier(id);

                if (!success)
                {
                    return NotFound(new { message = "Kh�ng t�m th?y nh� cung c?p ?? x�a" });
                }

                return Ok(new { message = "X�a nh� cung c?p th�nh c�ng" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "L?i server", error = ex.Message });
            }
        }
    }
}