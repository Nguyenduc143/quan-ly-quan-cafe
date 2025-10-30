using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class OrderModel
    {
        public int Id { get; set; }
        public DateTime ThoiDiemVao { get; set; }
        public DateTime? ThoiDiemRa { get; set; }
        public int IdBan { get; set; }
        public int TrangThaiHD { get; set; } // 0: Chưa thanh toán, 1: Đã thanh toán
        public int? IdNhanVien { get; set; }
        public List<OrderDetailModel> ChiTietHoaDonBan { get; set; }
    }

    public class OrderDetailModel
    {
        public int IdHoaDonBan { get; set; }
        public int IdMonAn { get; set; }
        public int SoLuong { get; set; }
    }

    public class CreateOrderRequest
    {
        [Required]
        public int IdBan { get; set; }
        public int? IdNhanVien { get; set; }
        [Required]
        public List<CreateOrderDetailRequest> ChiTietHoaDonBan { get; set; }
    }

    public class CreateOrderDetailRequest
    {
        [Required]
        public int IdMonAn { get; set; }
        [Required]
        public int SoLuong { get; set; }
    }

    public class UpdateOrderRequest
    {
        public DateTime? ThoiDiemRa { get; set; }
        public int? IdNhanVien { get; set; }
        public List<CreateOrderDetailRequest> ChiTietHoaDonBan { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        [Required]
        [Range(0, 1)]
        public int TrangThaiHD { get; set; }
        public DateTime? ThoiDiemRa { get; set; }
    }
}
