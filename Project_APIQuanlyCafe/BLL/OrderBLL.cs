﻿using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Models;
using DAL;

namespace BLL
{
    public class OrderBLL
    {
        private readonly OrderDAL _orderDAL;
        
        public OrderBLL(IConfiguration configuration)
        {
            _orderDAL = new OrderDAL(configuration);
        }
        
        // Lấy danh sách tất cả đơn hàng
        public List<OrderModel> GetAllOrders()
        {
            try
            {
                return _orderDAL.GetAllOrders();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách đơn hàng: {ex.Message}");
            }
        }
        
        // Lấy đơn hàng theo ID
        public OrderModel GetOrderById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");
                
            try
            {
                var order = _orderDAL.GetOrderById(id);
                if (order == null)
                    throw new Exception("Không tìm thấy đơn hàng");
                    
                return order;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy đơn hàng: {ex.Message}");
            }
        }
        
        // Tạo đơn hàng mới
        public int CreateOrder(CreateOrderRequest request)
        {
            // Validation
            ValidateCreateOrderRequest(request);
            
            try
            {
                return _orderDAL.CreateOrder(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo đơn hàng: {ex.Message}");
            }
        }
        
        // Cập nhật đơn hàng
        public bool UpdateOrder(int id, UpdateOrderRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");
                
            // Kiểm tra đơn hàng có tồn tại không
            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");
                
            // Kiểm tra trạng thái đơn hàng
            if (existingOrder.TrangThaiHD == 1)
                throw new Exception("Không thể cập nhật đơn hàng đã thanh toán");
            
            ValidateUpdateOrderRequest(request);
            
            try
            {
                return _orderDAL.UpdateOrder(id, request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật đơn hàng: {ex.Message}");
            }
        }
        
        // Xóa đơn hàng
        public bool DeleteOrder(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");
                
            // Kiểm tra đơn hàng có tồn tại không
            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");
                
            // Kiểm tra trạng thái đơn hàng
            if (existingOrder.TrangThaiHD == 1)
                throw new Exception("Không thể xóa đơn hàng đã thanh toán");
            
            try
            {
                return _orderDAL.DeleteOrder(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa đơn hàng: {ex.Message}");
            }
        }
        
        // Cập nhật trạng thái đơn hàng
        public bool UpdateOrderStatus(int id, UpdateOrderStatusRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");
                
            // Kiểm tra đơn hàng có tồn tại không
            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");
            
            // Nếu chuyển sang trạng thái đã thanh toán và chưa có thời điểm ra
            if (request.TrangThaiHD == 1 && !request.ThoiDiemRa.HasValue)
            {
                request.ThoiDiemRa = DateTime.Now;
            }
            
            try
            {
                return _orderDAL.UpdateOrderStatus(id, request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật trạng thái đơn hàng: {ex.Message}");
            }
        }
        
        // Lấy đơn hàng theo bàn
        public List<OrderModel> GetOrdersByTableId(int tableId)
        {
            if (tableId <= 0)
                throw new ArgumentException("ID bàn không hợp lệ");
                
            try
            {
                return _orderDAL.GetOrdersByTableId(tableId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy đơn hàng theo bàn: {ex.Message}");
            }
        }
        
        // Validation methods
        private void ValidateCreateOrderRequest(CreateOrderRequest request)
        {
            if (request == null)
                throw new ArgumentException("Dữ liệu đơn hàng không được để trống");
                
            if (request.IdBanAn <= 0)
                throw new ArgumentException("ID bàn ăn không hợp lệ");
                
            if (request.DetailOrders == null || request.DetailOrders.Count == 0)
                throw new ArgumentException("Đơn hàng phải có ít nhất một món ăn");
                
            foreach (var detail in request.DetailOrders)
            {
                if (detail.IdMonAn <= 0)
                    throw new ArgumentException("ID món ăn không hợp lệ");
                    
                if (detail.SoLuong <= 0)
                    throw new ArgumentException("Số lượng món ăn phải lớn hơn 0");
            }
        }
        
        private void ValidateUpdateOrderRequest(UpdateOrderRequest request)
        {
            if (request == null)
                throw new ArgumentException("Dữ liệu cập nhật không được để trống");
                
            if (request.DetailOrders != null && request.DetailOrders.Count > 0)
            {
                foreach (var detail in request.DetailOrders)
                {
                    if (detail.IdMonAn <= 0)
                        throw new ArgumentException("ID món ăn không hợp lệ");
                        
                    if (detail.SoLuong <= 0)
                        throw new ArgumentException("Số lượng món ăn phải lớn hơn 0");
                }
            }
        }
    }
}
