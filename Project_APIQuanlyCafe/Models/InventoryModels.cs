using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class InventoryModel
    {
        public int Id { get; set; }
        public string TenNguyenLieu { get; set; } = string.Empty;
        public string? DonViTinh { get; set; }
        public double SoLuongTon { get; set; } = 0;
        public string? GhiChu { get; set; }
    }

    

    public class CreateInventoryRequest
    {
        public string TenNguyenLieu { get; set; } = string.Empty;
        public string? DonViTinh { get; set; }
        public double SoLuongTon { get; set; } = 0;
        public string? GhiChu { get; set; }
    }

    public class UpdateInventoryRequest
    {
        public string TenNguyenLieu { get; set; } = string.Empty;
        public string? DonViTinh { get; set; }
        public double SoLuongTon { get; set; } = 0;
        public string? GhiChu { get; set; }
    }

    
}