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
        
        [Required(ErrorMessage = "T�n nh� cung c?p kh�ng ???c ?? tr?ng")]
        [StringLength(100, ErrorMessage = "T�n nh� cung c?p kh�ng ???c v??t qu� 100 k� t?")]
        public string TenNhaCungCap { get; set; } = string.Empty;
        
        [StringLength(255, ErrorMessage = "??a ch? kh�ng ???c v??t qu� 255 k� t?")]
        public string? DiaChi { get; set; }
        
        [StringLength(15, ErrorMessage = "S? ?i?n tho?i kh�ng ???c v??t qu� 15 k� t?")]
        [Phone(ErrorMessage = "S? ?i?n tho?i kh�ng h?p l?")]
        public string? Sdt { get; set; }
        
        [StringLength(100, ErrorMessage = "Email kh�ng ???c v??t qu� 100 k� t?")]
        [EmailAddress(ErrorMessage = "Email kh�ng h?p l?")]
        public string? Email { get; set; }
    }
    
    public class CreateSupplierRequest
    {
        [Required(ErrorMessage = "T�n nh� cung c?p kh�ng ???c ?? tr?ng")]
        [StringLength(100, ErrorMessage = "T�n nh� cung c?p kh�ng ???c v??t qu� 100 k� t?")]
        public string TenNhaCungCap { get; set; } = string.Empty;
        
        [StringLength(255, ErrorMessage = "??a ch? kh�ng ???c v??t qu� 255 k� t?")]
        public string? DiaChi { get; set; }
        
        [StringLength(15, ErrorMessage = "S? ?i?n tho?i kh�ng ???c v??t qu� 15 k� t?")]
        [Phone(ErrorMessage = "S? ?i?n tho?i kh�ng h?p l?")]
        public string? Sdt { get; set; }
        
        [StringLength(100, ErrorMessage = "Email kh�ng ???c v??t qu� 100 k� t?")]
        [EmailAddress(ErrorMessage = "Email kh�ng h?p l?")]
        public string? Email { get; set; }
    }
}
