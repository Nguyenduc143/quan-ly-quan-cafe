using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;

namespace DAL
{
    public class InvoiceDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public InvoiceDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Lấy danh sách hóa đơn đã thanh toán
        public List<InvoiceModel> GetPaidInvoices()
        {
            string sql = @"SELECT id, thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien 
                          FROM HoaDonBan 
                          WHERE trangThaiHD = 1
                          ORDER BY thoiDiemVao DESC";

            DataTable dt = _dbHelper.ExecuteQuery(sql);
            return ConvertDataTableToInvoiceList(dt);
        }

        // Lấy chi tiết hóa đơn theo ID (chỉ hóa đơn đã thanh toán)
        public InvoiceModel? GetPaidInvoiceById(int id)
        {
            string sql = @"SELECT id, thoiDiemVao, thoiDiemRa, idBanAn, trangThaiHD, idNhanVien 
                          FROM HoaDonBan 
                          WHERE id = @id AND trangThaiHD = 1";

            SqlParameter[] parameters = {
                new SqlParameter("@id", id)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            
            if (dt.Rows.Count == 0)
                return null;

            var invoice = ConvertDataRowToInvoice(dt.Rows[0]);
            invoice.ChiTietHoaDon = GetInvoiceDetails(id);
            
            return invoice;
        }

        // Lấy chi tiết hóa đơn để in
        public PrintInvoiceModel? GetPrintInvoiceById(int id)
        {
            string sql = @"SELECT hd.id, hd.thoiDiemVao, hd.thoiDiemRa, hd.idBanAn, hd.trangThaiHD, hd.idNhanVien,
                                 b.tenBan as TenBanAn, nv.hoTen as TenNhanVien
                          FROM HoaDonBan hd
                          LEFT JOIN Ban b ON hd.idBanAn = b.id
                          LEFT JOIN NhanVien nv ON hd.idNhanVien = nv.id
                          WHERE hd.id = @id AND hd.trangThaiHD = 1";

            SqlParameter[] parameters = {
                new SqlParameter("@id", id)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            
            if (dt.Rows.Count == 0)
                return null;

            var row = dt.Rows[0];
            var printInvoice = new PrintInvoiceModel
            {
                Id = Convert.ToInt32(row["id"]),
                ThoiDiemVao = Convert.ToDateTime(row["thoiDiemVao"]),
                ThoiDiemRa = row["thoiDiemRa"] == DBNull.Value ? null : Convert.ToDateTime(row["thoiDiemRa"]),
                IdBanAn = Convert.ToInt32(row["idBanAn"]),
                TenBanAn = row["TenBanAn"]?.ToString(),
                TenNhanVien = row["TenNhanVien"]?.ToString(),
                ChiTietHoaDon = GetInvoiceDetailsWithPrice(id)
            };

            return printInvoice;
        }

        // Kiểm tra trạng thái hóa đơn
        public bool IsInvoicePaid(int id)
        {
            string sql = "SELECT trangThaiHD FROM HoaDonBan WHERE id = @id";
            SqlParameter[] parameters = {
                new SqlParameter("@id", id)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            
            if (dt.Rows.Count == 0)
                return false;

            return Convert.ToInt32(dt.Rows[0]["trangThaiHD"]) == 1;
        }

        // Lấy chi tiết hóa đơn
        private List<InvoiceDetailModel> GetInvoiceDetails(int invoiceId)
        {
            string sql = @"SELECT ct.id, ct.idHoaDonBan, ct.idMonAn, ct.soLuong,
                                 ma.tenMonAn
                          FROM ChiTietHoaDonBan ct
                          INNER JOIN MonAn ma ON ct.idMonAn = ma.id
                          WHERE ct.idHoaDonBan = @invoiceId";

            SqlParameter[] parameters = {
                new SqlParameter("@invoiceId", invoiceId)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            return ConvertDataTableToInvoiceDetailList(dt);
        }

        // Lấy chi tiết hóa đơn kèm giá để in
        private List<InvoiceDetailModel> GetInvoiceDetailsWithPrice(int invoiceId)
        {
            string sql = @"SELECT ct.id, ct.idHoaDonBan, ct.idMonAn, ct.soLuong,
                                 ma.tenMonAn, ma.giaTien as GiaMonAn
                          FROM ChiTietHoaDonBan ct
                          INNER JOIN MonAn ma ON ct.idMonAn = ma.id
                          WHERE ct.idHoaDonBan = @invoiceId";

            SqlParameter[] parameters = {
                new SqlParameter("@invoiceId", invoiceId)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            return ConvertDataTableToInvoiceDetailListWithPrice(dt);
        }

        // Helper methods để convert DataTable sang Object
        private List<InvoiceModel> ConvertDataTableToInvoiceList(DataTable dt)
        {
            var invoices = new List<InvoiceModel>();
            foreach (DataRow row in dt.Rows)
            {
                invoices.Add(ConvertDataRowToInvoice(row));
            }
            return invoices;
        }

        private InvoiceModel ConvertDataRowToInvoice(DataRow row)
        {
            return new InvoiceModel
            {
                Id = Convert.ToInt32(row["id"]),
                ThoiDiemVao = Convert.ToDateTime(row["thoiDiemVao"]),
                ThoiDiemRa = row["thoiDiemRa"] == DBNull.Value ? null : Convert.ToDateTime(row["thoiDiemRa"]),
                IdBanAn = Convert.ToInt32(row["idBanAn"]),
                TrangThaiHD = Convert.ToInt32(row["trangThaiHD"]),
                IdNhanVien = row["idNhanVien"] == DBNull.Value ? null : Convert.ToInt32(row["idNhanVien"])
            };
        }

        private List<InvoiceDetailModel> ConvertDataTableToInvoiceDetailList(DataTable dt)
        {
            var details = new List<InvoiceDetailModel>();
            foreach (DataRow row in dt.Rows)
            {
                details.Add(new InvoiceDetailModel
                {
                    Id = Convert.ToInt32(row["id"]),
                    IdHoaDonBan = Convert.ToInt32(row["idHoaDonBan"]),
                    IdMonAn = Convert.ToInt32(row["idMonAn"]),
                    SoLuong = Convert.ToInt32(row["soLuong"]),
                    TenMonAn = row["tenMonAn"]?.ToString()
                });
            }
            return details;
        }

        private List<InvoiceDetailModel> ConvertDataTableToInvoiceDetailListWithPrice(DataTable dt)
        {
            var details = new List<InvoiceDetailModel>();
            foreach (DataRow row in dt.Rows)
            {
                details.Add(new InvoiceDetailModel
                {
                    Id = Convert.ToInt32(row["id"]),
                    IdHoaDonBan = Convert.ToInt32(row["idHoaDonBan"]),
                    IdMonAn = Convert.ToInt32(row["idMonAn"]),
                    SoLuong = Convert.ToInt32(row["soLuong"]),
                    TenMonAn = row["tenMonAn"]?.ToString(),
                    GiaMonAn = row["GiaMonAn"] == DBNull.Value ? null : Convert.ToDecimal(row["GiaMonAn"])
                });
            }
            return details;
        }
    }
}
