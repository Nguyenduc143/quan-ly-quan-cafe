using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class SupplierModel
    {
        public int Id { get; set; }
        
        [Required(ErrorMessage = "Tên nhà cung c?p không ???c ?? tr?ng")]
        [StringLength(100, ErrorMessage = "Tên nhà cung c?p không ???c v??t quá 100 ký t?")]
        public string TenNhaCungCap { get; set; } = string.Empty;
        
        [StringLength(255, ErrorMessage = "??a ch? không ???c v??t quá 255 ký t?")]
        public string? DiaChi { get; set; }
        
        [StringLength(15, ErrorMessage = "S? ?i?n tho?i không ???c v??t quá 15 ký t?")]
        [Phone(ErrorMessage = "S? ?i?n tho?i không h?p l?")]
        public string? Sdt { get; set; }
        
        [StringLength(100, ErrorMessage = "Email không ???c v??t quá 100 ký t?")]
        [EmailAddress(ErrorMessage = "Email không h?p l?")]
        public string? Email { get; set; }
    }
    
    public class CreateSupplierRequest
    {
        [Required(ErrorMessage = "Tên nhà cung c?p không ???c ?? tr?ng")]
        [StringLength(100, ErrorMessage = "Tên nhà cung c?p không ???c v??t quá 100 ký t?")]
        public string TenNhaCungCap { get; set; } = string.Empty;
        
        [StringLength(255, ErrorMessage = "??a ch? không ???c v??t quá 255 ký t?")]
        public string? DiaChi { get; set; }
        
        [StringLength(15, ErrorMessage = "S? ?i?n tho?i không ???c v??t quá 15 ký t?")]
        [Phone(ErrorMessage = "S? ?i?n tho?i không h?p l?")]
        public string? Sdt { get; set; }
        
        [StringLength(100, ErrorMessage = "Email không ???c v??t quá 100 ký t?")]
        [EmailAddress(ErrorMessage = "Email không h?p l?")]
        public string? Email { get; set; }
    }
}
