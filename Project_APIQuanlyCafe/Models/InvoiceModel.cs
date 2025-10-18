using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class InvoiceModel
    {
        public int Id { get; set; }
        public DateTime ThoiDiemVao { get; set; }
        public DateTime? ThoiDiemRa { get; set; }
        public int IdBanAn { get; set; }
        public int TrangThaiHD { get; set; }
        public int? IdNhanVien { get; set; }
        
        // Navigation properties
        public List<InvoiceDetailModel> ChiTietHoaDon { get; set; } = new List<InvoiceDetailModel>();
    }

    public class InvoiceDetailModel
    {
        public int Id { get; set; }
        public int IdHoaDonBan { get; set; }
        public int IdMonAn { get; set; }
        public int SoLuong { get; set; }
        
        // Thông tin bổ sung cho việc hiển thị
        public string? TenMonAn { get; set; }
        public decimal? GiaMonAn { get; set; }
        public decimal? ThanhTien => GiaMonAn * SoLuong;
    }

    // Model cho việc in hóa đơn
    public class PrintInvoiceModel
    {
        public int Id { get; set; }
        public DateTime ThoiDiemVao { get; set; }
        public DateTime? ThoiDiemRa { get; set; }
        public int IdBanAn { get; set; }
        public string? TenBanAn { get; set; }
        public string? TenNhanVien { get; set; }
        public List<InvoiceDetailModel> ChiTietHoaDon { get; set; } = new List<InvoiceDetailModel>();
        public decimal TongTien => ChiTietHoaDon.Sum(x => x.ThanhTien ?? 0);
    }
}
