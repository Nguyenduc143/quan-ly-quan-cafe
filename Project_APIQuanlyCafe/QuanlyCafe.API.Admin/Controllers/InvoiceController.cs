using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;
using DAL;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly InvoiceBLL _invoiceBLL;

        public InvoicesController(InvoiceBLL invoiceBLL)
        {
            _invoiceBLL = invoiceBLL;
        }

        /// <summary>
        /// Lấy danh sách hóa đơn đã thanh toán
        /// </summary>
        /// <returns>Danh sách hóa đơn đã thanh toán</returns>
        [HttpGet]
        public async Task<IActionResult> GetPaidInvoices()
        {
            try
            {
                var invoices = _invoiceBLL.GetPaidInvoices();
                
                if (invoices == null || !invoices.Any())
                {
                    return Ok(new { 
                        success = true, 
                        message = "Không có hóa đơn nào đã thanh toán", 
                        data = new List<InvoiceModel>() 
                    });
                }

                return Ok(new { 
                    success = true, 
                    message = "Lấy danh sách hóa đơn thành công", 
                    data = invoices 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Lỗi: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// Lấy chi tiết hóa đơn theo ID (chỉ hóa đơn đã thanh toán)
        /// </summary>
        /// <param name="id">ID của hóa đơn</param>
        /// <returns>Chi tiết hóa đơn</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaidInvoiceById(int id)
        {
            try
            {
                var invoice = _invoiceBLL.GetPaidInvoiceById(id);
                
                if (invoice == null)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Không tìm thấy hóa đơn đã thanh toán với ID này" 
                    });
                }

                return Ok(new { 
                    success = true, 
                    message = "Lấy chi tiết hóa đơn thành công", 
                    data = invoice 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = ex.Message 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Lỗi: {ex.Message}" 
                });
            }
        }

        /// <summary>
        /// In hóa đơn (chỉ hóa đơn đã thanh toán)
        /// </summary>
        /// <param name="id">ID của hóa đơn</param>
        /// <returns>Thông tin hóa đơn để in</returns>
        [HttpPost("{id}/print")]
        public async Task<IActionResult> PrintInvoice(int id)
        {
            try
            {
                var printInvoice = _invoiceBLL.ProcessPrintInvoice(id);
                
                if (printInvoice == null)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Không tìm thấy hóa đơn để in" 
                    });
                }

                return Ok(new { 
                    success = true, 
                    message = "Lấy thông tin hóa đơn để in thành công", 
                    data = printInvoice,
                    printTime = DateTime.Now
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = ex.Message 
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = ex.Message 
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { 
                    success = false, 
                    message = $"Lỗi: {ex.Message}" 
                });
            }
        }
    }
}
