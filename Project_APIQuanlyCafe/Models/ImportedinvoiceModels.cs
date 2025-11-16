using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ImportedinvoiceModel
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "ID nhân viên không được để trống")]
        public int IdNhanVien { get; set; }
        
        [Required(ErrorMessage = "ID nhà cung cấp không được để trống")]
        public int IdNhaCungCap { get; set; }
        
        [Required(ErrorMessage = "Ngày nhập không được để trống")]
        public DateTime NgayNhap { get; set; }
        
        [Required(ErrorMessage = "Tổng tiền không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Tổng tiền phải lớn hơn hoặc bằng 0")]
        public float TongTien { get; set; }
        
        // Navigation properties
        public string? TenNhanVien { get; set; }
        public string? TenNhaCungCap { get; set; }
        public List<ImportedinvoiceDetailModel>? ChiTiet { get; set; }
    }
    
    public class ImportedinvoiceDetailModel
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "ID hóa đơn nhập không được để trống")]
        public int IdHoaDonNhap { get; set; }
        
        [Required(ErrorMessage = "ID nguyên liệu không được để trống")]
        public int IdNguyenLieu { get; set; }
        
        [Required(ErrorMessage = "Số lượng không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; }
        
        [Required(ErrorMessage = "Đơn vị tính không được để trống")]
        [StringLength(50, ErrorMessage = "Đơn vị tính không được vượt quá 50 ký tự")]
        public string DonViTinh { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Đơn giá không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Đơn giá phải lớn hơn hoặc bằng 0")]
        public float DonGia { get; set; }
        
        // Navigation property
        public string? TenNguyenLieu { get; set; }
    }
    
    public class CreateImportedinvoiceRequest
    {
        [Required(ErrorMessage = "ID nhân viên không được để trống")]
        public int IdNhanVien { get; set; }
        
        [Required(ErrorMessage = "ID nhà cung cấp không được để trống")]
        public int IdNhaCungCap { get; set; }
        
        [Required(ErrorMessage = "Ngày nhập không được để trống")]
        public DateTime NgayNhap { get; set; }
        
        [Required(ErrorMessage = "Chi tiết hóa đơn không được để trống")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 chi tiết hóa đơn")]
        public List<CreateImportedinvoiceDetailRequest> ChiTiet { get; set; } = new List<CreateImportedinvoiceDetailRequest>();
    }
    
    public class CreateImportedinvoiceDetailRequest
    {
        [Required(ErrorMessage = "ID nguyên liệu không được để trống")]
        public int IdNguyenLieu { get; set; }
        
        [Required(ErrorMessage = "Số lượng không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; }
        
        [Required(ErrorMessage = "Đơn vị tính không được để trống")]
        [StringLength(50, ErrorMessage = "Đơn vị tính không được vượt quá 50 ký tự")]
        public string DonViTinh { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Đơn giá không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Đơn giá phải lớn hơn hoặc bằng 0")]
        public float DonGia { get; set; }
    }
    
    public class UpdateImportedinvoiceRequest
    {
        [Required(ErrorMessage = "ID nhân viên không được để trống")]
        public int IdNhanVien { get; set; }
        
        [Required(ErrorMessage = "ID nhà cung cấp không được để trống")]
        public int IdNhaCungCap { get; set; }
        
        [Required(ErrorMessage = "Ngày nhập không được để trống")]
        public DateTime NgayNhap { get; set; }
        
        [Required(ErrorMessage = "Chi tiết hóa đơn không được để trống")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 chi tiết hóa đơn")]
        public List<CreateImportedinvoiceDetailRequest> ChiTiet { get; set; } = new List<CreateImportedinvoiceDetailRequest>();
    }
    
    public class ImportedinvoiceSearchRequest
    {
        public int? IdNhanVien { get; set; }
        public int? IdNhaCungCap { get; set; }
        public DateTime? TuNgay { get; set; }
        public DateTime? DenNgay { get; set; }
        public float? TongTienMin { get; set; }
        public float? TongTienMax { get; set; }
    }
}
