using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class EmployeesModel
    {
        public int Id { get; set; }
        [Required]
        public string HoTen { get; set; } = string.Empty;
        public DateTime? NgaySinh { get; set; }
        public string? GioiTinh { get; set; }
        public string? Sdt { get; set; }
        public string? DiaChi { get; set; }
        public int? Luong { get; set; }
        public string? ChucVu { get; set; }
    }
}
