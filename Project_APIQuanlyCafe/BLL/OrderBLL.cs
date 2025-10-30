using System;
using System.Collections.Generic;
using DAL;
using Models;

namespace BLL
{
    public class OrderBLL
    {
        private readonly OrderDAL _orderDAL;

        public OrderBLL(OrderDAL orderDAL)
        {
            _orderDAL = orderDAL;
        }

        // Lấy danh sách tất cả đơn hàng
        public List<OrderModel> GetAllOrders()
        {
            return _orderDAL.GetAllOrders();
        }

        // Lấy đơn hàng theo ID
        public OrderModel GetOrderById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");

            var order = _orderDAL.GetOrderById(id);
            if (order == null)
                throw new Exception("Không tìm thấy đơn hàng");

            return order;
        }

        // Tạo đơn hàng mới
        public int CreateOrder(CreateOrderRequest request)
        {
            ValidateCreateOrderRequest(request);
            return _orderDAL.CreateOrder(request);
        }

        // Cập nhật đơn hàng
        public bool UpdateOrder(int id, UpdateOrderRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");

            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (existingOrder.TrangThaiHD == 1)
                throw new Exception("Không thể cập nhật đơn hàng đã thanh toán");

            ValidateUpdateOrderRequest(request);

            return _orderDAL.UpdateOrder(id, request);
        }

        // Xóa đơn hàng
        public bool DeleteOrder(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");

            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");

            if (existingOrder.TrangThaiHD == 1)
                throw new Exception("Không thể xóa đơn hàng đã thanh toán");

            return _orderDAL.DeleteOrder(id);
        }

        // Cập nhật trạng thái đơn hàng
        public bool UpdateOrderStatus(int id, UpdateOrderStatusRequest request)
        {
            if (id <= 0)
                throw new ArgumentException("ID đơn hàng không hợp lệ");

            var existingOrder = _orderDAL.GetOrderById(id);
            if (existingOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");

            // Nếu chuyển sang trạng thái đã thanh toán và chưa có thời điểm ra
            if (request.TrangThaiHD == 1 && !request.ThoiDiemRa.HasValue)
            {
                request.ThoiDiemRa = DateTime.Now;
            }

            return _orderDAL.UpdateOrderStatus(id, request);
        }

        // Lấy đơn hàng theo bàn
        public List<OrderModel> GetOrdersByTableId(int tableId)
        {
            if (tableId <= 0)
                throw new ArgumentException("ID bàn không hợp lệ");

            return _orderDAL.GetOrdersByTableId(tableId);
        }

        // Validation methods
        private void ValidateCreateOrderRequest(CreateOrderRequest request)
        {
            if (request == null)
                throw new ArgumentException("Dữ liệu đơn hàng không được để trống");

            if (request.IdBan <= 0)
                throw new ArgumentException("ID bàn không hợp lệ");

            if (request.ChiTietHoaDonBan == null || request.ChiTietHoaDonBan.Count == 0)
                throw new ArgumentException("Đơn hàng phải có ít nhất một món ăn");

            foreach (var detail in request.ChiTietHoaDonBan)
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

            if (request.ChiTietHoaDonBan != null && request.ChiTietHoaDonBan.Count > 0)
            {
                foreach (var detail in request.ChiTietHoaDonBan)
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
