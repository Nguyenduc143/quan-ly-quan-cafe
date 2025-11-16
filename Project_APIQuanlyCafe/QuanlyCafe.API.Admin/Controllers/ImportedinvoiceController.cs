using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImportedinvoiceController : ControllerBase
    {
        private readonly ImportedinvoiceBLL _importedinvoiceBLL;

        public ImportedinvoiceController(ImportedinvoiceBLL importedinvoiceBLL)
        {
            _importedinvoiceBLL = importedinvoiceBLL;
        }

        /// <summary>
        /// Lấy danh sách tất cả hóa đơn nhập
        /// </summary>
        /// <returns>Danh sách hóa đơn nhập</returns>
        [HttpGet]
        public ActionResult<List<ImportedinvoiceModel>> GetAllImportedinvoices()
        {
            try
            {
                var invoices = _importedinvoiceBLL.GetAllImportedinvoices();
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết hóa đơn nhập theo ID
        /// </summary>
        /// <param name="id">ID của hóa đơn nhập</param>
        /// <returns>Thông tin hóa đơn nhập</returns>
        [HttpGet("{id}")]
        public ActionResult<ImportedinvoiceModel> GetImportedinvoiceById(int id)
        {
            try
            {
                var invoice = _importedinvoiceBLL.GetImportedinvoiceById(id);

                if (invoice == null)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nhập" });
                }

                return Ok(invoice);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy chi tiết hóa đơn nhập
        /// </summary>
        /// <param name="id">ID của hóa đơn nhập</param>
        /// <returns>Danh sách chi tiết hóa đơn</returns>
        [HttpGet("{id}/details")]
        public ActionResult<List<ImportedinvoiceDetailModel>> GetImportedinvoiceDetails(int id)
        {
            try
            {
                var details = _importedinvoiceBLL.GetImportedinvoiceDetails(id);
                return Ok(details);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Thêm hóa đơn nhập mới
        /// </summary>
        /// <param name="request">Thông tin hóa đơn nhập</param>
        /// <returns>Thông tin hóa đơn nhập đã tạo</returns>
        [HttpPost]
        public ActionResult<ImportedinvoiceModel> CreateImportedinvoice([FromBody] CreateImportedinvoiceRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newInvoiceId = _importedinvoiceBLL.CreateImportedinvoice(request);
                var createdInvoice = _importedinvoiceBLL.GetImportedinvoiceById(newInvoiceId);

                return CreatedAtAction(nameof(GetImportedinvoiceById), new { id = newInvoiceId }, createdInvoice);
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
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin hóa đơn nhập
        /// </summary>
        /// <param name="id">ID của hóa đơn nhập</param>
        /// <param name="request">Thông tin hóa đơn nhập cập nhật</param>
        /// <returns>Thông tin hóa đơn nhập đã cập nhật</returns>
        [HttpPut("{id}")]
        public ActionResult<ImportedinvoiceModel> UpdateImportedinvoice(int id, [FromBody] UpdateImportedinvoiceRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = _importedinvoiceBLL.UpdateImportedinvoice(id, request);

                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nhập để cập nhật" });
                }

                var updatedInvoice = _importedinvoiceBLL.GetImportedinvoiceById(id);
                return Ok(updatedInvoice);
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
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Xóa hóa đơn nhập
        /// </summary>
        /// <param name="id">ID của hóa đơn nhập</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public ActionResult DeleteImportedinvoice(int id)
        {
            try
            {
                var success = _importedinvoiceBLL.DeleteImportedinvoice(id);

                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy hóa đơn nhập để xóa" });
                }

                return Ok(new { message = "Xóa hóa đơn nhập thành công", id = id });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Tìm kiếm hóa đơn nhập theo các tiêu chí
        /// </summary>
        /// <param name="searchRequest">Thông tin tìm kiếm</param>
        /// <returns>Danh sách hóa đơn nhập tìm được</returns>
        [HttpPost("search")]
        public ActionResult<List<ImportedinvoiceModel>> SearchImportedinvoices([FromBody] ImportedinvoiceSearchRequest searchRequest)
        {
            try
            {
                if (searchRequest == null)
                {
                    searchRequest = new ImportedinvoiceSearchRequest();
                }

                var invoices = _importedinvoiceBLL.SearchImportedinvoices(searchRequest);
                return Ok(invoices);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Tìm kiếm hóa đơn nhập theo query parameters
        /// </summary>
        /// <param name="idNhanVien">ID nhân viên</param>
        /// <param name="idNhaCungCap">ID nhà cung cấp</param>
        /// <param name="tuNgay">Từ ngày</param>
        /// <param name="denNgay">Đến ngày</param>
        /// <param name="tongTienMin">Tổng tiền tối thiểu</param>
        /// <param name="tongTienMax">Tổng tiền tối đa</param>
        /// <returns>Danh sách hóa đơn nhập tìm được</returns>
        [HttpGet("search")]
        public ActionResult<List<ImportedinvoiceModel>> SearchImportedinvoicesByQuery(
            [FromQuery] int? idNhanVien,
            [FromQuery] int? idNhaCungCap,
            [FromQuery] DateTime? tuNgay,
            [FromQuery] DateTime? denNgay,
            [FromQuery] float? tongTienMin,
            [FromQuery] float? tongTienMax)
        {
            try
            {
                var searchRequest = new ImportedinvoiceSearchRequest
                {
                    IdNhanVien = idNhanVien,
                    IdNhaCungCap = idNhaCungCap,
                    TuNgay = tuNgay,
                    DenNgay = denNgay,
                    TongTienMin = tongTienMin,
                    TongTienMax = tongTienMax
                };

                var invoices = _importedinvoiceBLL.SearchImportedinvoices(searchRequest);
                return Ok(invoices);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
    }
}
