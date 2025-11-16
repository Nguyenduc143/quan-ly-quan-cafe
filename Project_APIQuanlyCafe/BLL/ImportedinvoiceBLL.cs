using DAL;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class ImportedinvoiceBLL
    {
        private readonly ImportedinvoiceDAL _importedinvoiceDAL;

        public ImportedinvoiceBLL(ImportedinvoiceDAL importedinvoiceDAL)
        {
            _importedinvoiceDAL = importedinvoiceDAL;
        }

        // Lấy tất cả hóa đơn nhập
        public List<ImportedinvoiceModel> GetAllImportedinvoices()
        {
            return _importedinvoiceDAL.GetAllImportedinvoices();
        }

        // Lấy hóa đơn nhập theo ID
        public ImportedinvoiceModel? GetImportedinvoiceById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            return _importedinvoiceDAL.GetImportedinvoiceById(id);
        }

        // Lấy chi tiết hóa đơn nhập
        public List<ImportedinvoiceDetailModel> GetImportedinvoiceDetails(int idHoaDonNhap)
        {
            if (idHoaDonNhap <= 0)
                throw new ArgumentException("ID hóa đơn phải lớn hơn 0");

            return _importedinvoiceDAL.GetImportedinvoiceDetails(idHoaDonNhap);
        }

        // Thêm hóa đơn nhập mới
        public int CreateImportedinvoice(CreateImportedinvoiceRequest request)
        {
            ValidateCreateRequest(request);
            return _importedinvoiceDAL.CreateImportedinvoice(request);
        }

        // Cập nhật hóa đơn nhập
        public bool UpdateImportedinvoice(int id, UpdateImportedinvoiceRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            ValidateUpdateRequest(request);
            return _importedinvoiceDAL.UpdateImportedinvoice(id, request);
        }

        // Xóa hóa đơn nhập
        public bool DeleteImportedinvoice(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            return _importedinvoiceDAL.DeleteImportedinvoice(id);
        }

        // Tìm kiếm hóa đơn nhập
        public List<ImportedinvoiceModel> SearchImportedinvoices(ImportedinvoiceSearchRequest searchRequest)
        {
            if (searchRequest == null)
                throw new ArgumentNullException(nameof(searchRequest), "Thông tin tìm kiếm không được để trống");

            // Validate date range
            if (searchRequest.TuNgay.HasValue && searchRequest.DenNgay.HasValue)
            {
                if (searchRequest.TuNgay.Value > searchRequest.DenNgay.Value)
                    throw new ArgumentException("Từ ngày phải nhỏ hơn hoặc bằng đến ngày");
            }

            // Validate total amount range
            if (searchRequest.TongTienMin.HasValue && searchRequest.TongTienMax.HasValue)
            {
                if (searchRequest.TongTienMin.Value > searchRequest.TongTienMax.Value)
                    throw new ArgumentException("Tổng tiền tối thiểu phải nhỏ hơn hoặc bằng tổng tiền tối đa");
            }

            return _importedinvoiceDAL.SearchImportedinvoices(searchRequest);
        }

        // Private validation methods
        private static void ValidateCreateRequest(CreateImportedinvoiceRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin hóa đơn không được để trống");

            if (request.IdNhanVien <= 0)
                throw new ArgumentException("ID nhân viên không hợp lệ");

            if (request.IdNhaCungCap <= 0)
                throw new ArgumentException("ID nhà cung cấp không hợp lệ");

            if (request.NgayNhap > DateTime.Now)
                throw new ArgumentException("Ngày nhập không được lớn hơn ngày hiện tại");

            if (request.ChiTiet == null || request.ChiTiet.Count == 0)
                throw new ArgumentException("Chi tiết hóa đơn không được để trống");

            // Validate chi tiết
            foreach (var detail in request.ChiTiet)
            {
                ValidateDetail(detail);
            }
        }

        private static void ValidateUpdateRequest(UpdateImportedinvoiceRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin hóa đơn không được để trống");

            if (request.IdNhanVien <= 0)
                throw new ArgumentException("ID nhân viên không hợp lệ");

            if (request.IdNhaCungCap <= 0)
                throw new ArgumentException("ID nhà cung cấp không hợp lệ");

            if (request.NgayNhap > DateTime.Now)
                throw new ArgumentException("Ngày nhập không được lớn hơn ngày hiện tại");

            if (request.ChiTiet == null || request.ChiTiet.Count == 0)
                throw new ArgumentException("Chi tiết hóa đơn không được để trống");

            // Validate chi tiết
            foreach (var detail in request.ChiTiet)
            {
                ValidateDetail(detail);
            }
        }

        private static void ValidateDetail(CreateImportedinvoiceDetailRequest detail)
        {
            if (detail == null)
                throw new ArgumentNullException(nameof(detail), "Chi tiết hóa đơn không được để trống");

//NEW CODE LINE
            if (detail.IdNguyenLieu <= 0)
                throw new ArgumentException("ID nguyên liệu không hợp lệ");

            if (detail.SoLuong <= 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0");

            if (string.IsNullOrWhiteSpace(detail.DonViTinh))
                throw new ArgumentException("Đơn vị tính không được để trống");

            if (detail.DonGia < 0)
                throw new ArgumentException("Đơn giá phải lớn hơn hoặc bằng 0");
        }
    }
}
