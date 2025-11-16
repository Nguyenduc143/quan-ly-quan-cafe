using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class ImportedinvoiceDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public ImportedinvoiceDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Lấy tất cả hóa đơn nhập
        public List<ImportedinvoiceModel> GetAllImportedinvoices()
        {
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllImportedinvoices");

            List<ImportedinvoiceModel> invoiceList = new List<ImportedinvoiceModel>();
            foreach (DataRow row in dt.Rows)
            {
                invoiceList.Add(MapDataRowToImportedinvoice(row));
            }
            return invoiceList;
        }

        // Lấy hóa đơn nhập theo ID
        public ImportedinvoiceModel? GetImportedinvoiceById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetImportedinvoiceById", parameters);

            if (dt.Rows.Count == 0)
                return null;

            var invoice = MapDataRowToImportedinvoice(dt.Rows[0]);
            
            // Lấy chi tiết hóa đơn
            invoice.ChiTiet = GetImportedinvoiceDetails(id);
            
            return invoice;
        }

        // Lấy chi tiết hóa đơn nhập
        public List<ImportedinvoiceDetailModel> GetImportedinvoiceDetails(int idHoaDonNhap)
        {
            SqlParameter[] parameters = { new SqlParameter("@idHoaDonNhap", idHoaDonNhap) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetImportedinvoiceDetails", parameters);

            List<ImportedinvoiceDetailModel> detailList = new List<ImportedinvoiceDetailModel>();
            foreach (DataRow row in dt.Rows)
            {
                detailList.Add(MapDataRowToImportedinvoiceDetail(row));
            }
            return detailList;
        }

        // Thêm hóa đơn nhập mới
        public int CreateImportedinvoice(CreateImportedinvoiceRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin hóa đơn không được để trống");

            if (request.ChiTiet == null || request.ChiTiet.Count == 0)
                throw new ArgumentException("Chi tiết hóa đơn không được để trống");

            // Tính tổng tiền
            float tongTien = 0;
            foreach (var detail in request.ChiTiet)
            {
                tongTien += detail.SoLuong * detail.DonGia;
            }

            SqlParameter[] parameters = {
                new SqlParameter("@idNhanVien", request.IdNhanVien),
                new SqlParameter("@idNhaCungCap", request.IdNhaCungCap),
                new SqlParameter("@ngayNhap", request.NgayNhap),
                new SqlParameter("@tongTien", tongTien)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CreateImportedinvoice", parameters);
            
            if (dt.Rows.Count > 0)
            {
                int newInvoiceId = Convert.ToInt32(dt.Rows[0]["NewID"]);
                
                // Thêm chi tiết hóa đơn
                foreach (var detail in request.ChiTiet)
                {
                    CreateImportedinvoiceDetail(newInvoiceId, detail);
                }
                
                return newInvoiceId;
            }
            return 0;
        }

        // Thêm chi tiết hóa đơn
        private void CreateImportedinvoiceDetail(int idHoaDonNhap, CreateImportedinvoiceDetailRequest detail)
        {
            SqlParameter[] parameters = {
                new SqlParameter("@idHoaDonNhap", idHoaDonNhap),
                new SqlParameter("@idNguyenLieu", detail.IdNguyenLieu),
                new SqlParameter("@soLuong", detail.SoLuong),
                new SqlParameter("@donViTinh", detail.DonViTinh),
                new SqlParameter("@donGia", detail.DonGia)
            };

            _dbHelper.ExecuteStoredProcedure("sp_CreateImportedinvoiceDetail", parameters);
        }

        // Cập nhật hóa đơn nhập
        public bool UpdateImportedinvoice(int id, UpdateImportedinvoiceRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin hóa đơn không được để trống");

            if (request.ChiTiet == null || request.ChiTiet.Count == 0)
                throw new ArgumentException("Chi tiết hóa đơn không được để trống");

            // Tính tổng tiền
            float tongTien = 0;
            foreach (var detail in request.ChiTiet)
            {
                tongTien += detail.SoLuong * detail.DonGia;
            }

            SqlParameter[] parameters = {
                new SqlParameter("@id", id),
                new SqlParameter("@idNhanVien", request.IdNhanVien),
                new SqlParameter("@idNhaCungCap", request.IdNhaCungCap),
                new SqlParameter("@ngayNhap", request.NgayNhap),
                new SqlParameter("@tongTien", tongTien)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_UpdateImportedinvoice", parameters);
            
            if (dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0)
            {
                // Xóa chi tiết cũ
                DeleteImportedinvoiceDetails(id);
                
                // Thêm chi tiết mới
                foreach (var detail in request.ChiTiet)
                {
                    CreateImportedinvoiceDetail(id, detail);
                }
                
                return true;
            }
            return false;
        }

        // Xóa chi tiết hóa đơn
        private void DeleteImportedinvoiceDetails(int idHoaDonNhap)
        {
            SqlParameter[] parameters = { new SqlParameter("@idHoaDonNhap", idHoaDonNhap) };
            _dbHelper.ExecuteStoredProcedure("sp_DeleteImportedinvoiceDetails", parameters);
        }

        // Xóa hóa đơn nhập
        public bool DeleteImportedinvoice(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            // Xóa chi tiết trước
            DeleteImportedinvoiceDetails(id);

            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_DeleteImportedinvoice", parameters);
            
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
            }
            return false;
        }

        // Tìm kiếm hóa đơn nhập
        public List<ImportedinvoiceModel> SearchImportedinvoices(ImportedinvoiceSearchRequest searchRequest)
        {
            List<SqlParameter> parameters = new List<SqlParameter>();

            if (searchRequest.IdNhanVien.HasValue)
                parameters.Add(new SqlParameter("@idNhanVien", searchRequest.IdNhanVien.Value));
            else
                parameters.Add(new SqlParameter("@idNhanVien", DBNull.Value));

            if (searchRequest.IdNhaCungCap.HasValue)
                parameters.Add(new SqlParameter("@idNhaCungCap", searchRequest.IdNhaCungCap.Value));
            else
                parameters.Add(new SqlParameter("@idNhaCungCap", DBNull.Value));

            if (searchRequest.TuNgay.HasValue)
                parameters.Add(new SqlParameter("@tuNgay", searchRequest.TuNgay.Value));
            else
                parameters.Add(new SqlParameter("@tuNgay", DBNull.Value));

            if (searchRequest.DenNgay.HasValue)
                parameters.Add(new SqlParameter("@denNgay", searchRequest.DenNgay.Value));
            else
                parameters.Add(new SqlParameter("@denNgay", DBNull.Value));

            if (searchRequest.TongTienMin.HasValue)
                parameters.Add(new SqlParameter("@tongTienMin", searchRequest.TongTienMin.Value));
            else
                parameters.Add(new SqlParameter("@tongTienMin", DBNull.Value));

            if (searchRequest.TongTienMax.HasValue)
                parameters.Add(new SqlParameter("@tongTienMax", searchRequest.TongTienMax.Value));
            else
                parameters.Add(new SqlParameter("@tongTienMax", DBNull.Value));

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_SearchImportedinvoices", parameters.ToArray());

            List<ImportedinvoiceModel> invoiceList = new List<ImportedinvoiceModel>();
            foreach (DataRow row in dt.Rows)
            {
                invoiceList.Add(MapDataRowToImportedinvoice(row));
            }
            return invoiceList;
        }

        // Helper methods
        private static ImportedinvoiceModel MapDataRowToImportedinvoice(DataRow row)
        {
            return new ImportedinvoiceModel
            {
                Id = Convert.ToInt32(row["id"]),
                IdNhanVien = Convert.ToInt32(row["idNhanVien"]),
                IdNhaCungCap = Convert.ToInt32(row["idNhaCungCap"]),
                NgayNhap = Convert.ToDateTime(row["ngayNhap"]),
                TongTien = Convert.ToSingle(row["tongTien"]),
                TenNhanVien = row.Table.Columns.Contains("tenNhanVien") && row["tenNhanVien"] != DBNull.Value 
                    ? row["tenNhanVien"].ToString() 
                    : null,
                TenNhaCungCap = row.Table.Columns.Contains("tenNhaCungCap") && row["tenNhaCungCap"] != DBNull.Value 
                    ? row["tenNhaCungCap"].ToString() 
                    : null
            };
        }

        private static ImportedinvoiceDetailModel MapDataRowToImportedinvoiceDetail(DataRow row)
        {
            return new ImportedinvoiceDetailModel
            {
                Id = Convert.ToInt32(row["id"]),
                IdHoaDonNhap = Convert.ToInt32(row["idHoaDonNhap"]),
                IdNguyenLieu = Convert.ToInt32(row["idNguyenLieu"]),
                SoLuong = Convert.ToInt32(row["soLuong"]),
                DonViTinh = row["donViTinh"].ToString() ?? string.Empty,
                DonGia = Convert.ToSingle(row["donGia"]),
                TenNguyenLieu = row.Table.Columns.Contains("tenNguyenLieu") && row["tenNguyenLieu"] != DBNull.Value 
                    ? row["tenNguyenLieu"].ToString() 
                    : null
            };
        }
    }
}
