using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL;
using Models;

namespace BLL
{
    public class InvoiceBLL
    {
        private readonly InvoiceDAL _invoiceDAL;

        public InvoiceBLL(InvoiceDAL invoiceDAL)
        {
            _invoiceDAL = invoiceDAL;
        }

        // Lấy danh sách hóa đơn đã thanh toán
        public List<InvoiceModel> GetPaidInvoices()
        {
            try
            {
                return _invoiceDAL.GetPaidInvoices();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách hóa đơn: {ex.Message}");
            }
        }

        // Lấy chi tiết hóa đơn theo ID (chỉ hóa đơn đã thanh toán)
        public InvoiceModel? GetPaidInvoiceById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    throw new ArgumentException("ID hóa đơn không hợp lệ");
                }

                return _invoiceDAL.GetPaidInvoiceById(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy chi tiết hóa đơn: {ex.Message}");
            }
        }

        // Xử lý in hóa đơn
        public PrintInvoiceModel? ProcessPrintInvoice(int id)
        {
            try
            {
                if (id <= 0)
                {
                    throw new ArgumentException("ID hóa đơn không hợp lệ");
                }

                // Kiểm tra xem hóa đơn có tồn tại và đã thanh toán chưa
                if (!_invoiceDAL.IsInvoicePaid(id))
                {
                    throw new InvalidOperationException("Không thể in hóa đơn chưa thanh toán hoặc hóa đơn không tồn tại");
                }

                // Lấy thông tin hóa đơn để in
                var printInvoice = _invoiceDAL.GetPrintInvoiceById(id);
                
                if (printInvoice == null)
                {
                    throw new InvalidOperationException("Không tìm thấy thông tin hóa đơn");
                }

                return printInvoice;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xử lý in hóa đơn: {ex.Message}");
            }
        }

        // Kiểm tra hóa đơn có tồn tại và đã thanh toán
        public bool CanPrintInvoice(int id)
        {
            try
            {
                return _invoiceDAL.IsInvoicePaid(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi kiểm tra trạng thái hóa đơn: {ex.Message}");
            }
        }
    }
}
