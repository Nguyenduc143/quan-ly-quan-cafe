using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class OrderModel
    {
        public int Id { get; set; }
        
        [Required]
        public DateTime ThoiDiemVao { get; set; } = DateTime.Now;
        
        public DateTime? ThoiDiemRa { get; set; }
        
        [Required]
        public int IdBanAn { get; set; }
        
        [Required]
        public int TrangThaiHD { get; set; } = 0; // 0: Chưa thanh toán, 1: Đã thanh toán
        
        public int? IdNhanVien { get; set; }
        
        // Navigation properties
        public List<DetailOrderModel> DetailOrders { get; set; } = new List<DetailOrderModel>();
    }
    
    public class DetailOrderModel
    {
        public int Id { get; set; }
        
        [Required]
        public int IdHoaDonBan { get; set; }
        
        [Required]
        public int IdMonAn { get; set; }
        
        [Required]
        public int SoLuong { get; set; } = 0;
    }
    
    // DTO models for API requests/responses
    public class CreateOrderRequest
    {
        [Required]
        public int IdBanAn { get; set; }
        
        public int? IdNhanVien { get; set; }
        
        public List<CreateDetailOrderRequest> DetailOrders { get; set; } = new List<CreateDetailOrderRequest>();
    }
    
    public class CreateDetailOrderRequest
    {
        [Required]
        public int IdMonAn { get; set; }
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")]
        public int SoLuong { get; set; }
    }
    
    public class UpdateOrderRequest
    {
        public DateTime? ThoiDiemRa { get; set; }
        public int? IdNhanVien { get; set; }
        public List<CreateDetailOrderRequest> DetailOrders { get; set; } = new List<CreateDetailOrderRequest>();
    }
    
    public class UpdateOrderStatusRequest
    {
        [Required]
        [Range(0, 1, ErrorMessage = "Trạng thái chỉ có thể là 0 (Chưa thanh toán) hoặc 1 (Đã thanh toán)")]
        public int TrangThaiHD { get; set; }
        
        public DateTime? ThoiDiemRa { get; set; }
    }
}
