using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Models;

namespace DAL
{
    public class OrderDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public OrderDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public List<OrderModel> GetAllOrders()
        {
            var orders = new List<OrderModel>();
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllOrders");

            foreach (DataRow row in dt.Rows)
            {
                var order = MapOrderFromDataRow(row);
                order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                orders.Add(order);
            }

            return orders;
        }

        public OrderModel GetOrderById(int id)
        {
            SqlParameter[] parameters = { new SqlParameter("@Id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetOrderById", parameters);

            if (dt.Rows.Count > 0)
            {
                var order = MapOrderFromDataRow(dt.Rows[0]);
                order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                return order;
            }

            return null;
        }

        public int CreateOrder(CreateOrderRequest request)
        {
            SqlParameter[] orderParams = {
                new SqlParameter("@ThoiDiemVao", DateTime.Now),
                new SqlParameter("@IdBanan", request.IdBan),
                new SqlParameter("@TrangThaiHD", 0),
                new SqlParameter("@IdNhanVien", (object?)request.IdNhanVien ?? DBNull.Value)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CreateOrder", orderParams);
            int newOrderId = 0;

            if (dt.Rows.Count > 0)
            {
                newOrderId = Convert.ToInt32(dt.Rows[0]["NewID"]);

                // Add order details
                foreach (var detail in request.ChiTietHoaDonBan)
                {
                    SqlParameter[] detailParams = {
                        new SqlParameter("@IdHoaDonBan", newOrderId),
                        new SqlParameter("@IdMonAn", detail.IdMonAn),
                        new SqlParameter("@SoLuong", detail.SoLuong)
                    };
                    _dbHelper.ExecuteStoredProcedure("sp_CreateOrderDetail", detailParams);
                }
            }

            return newOrderId;
        }

        public bool UpdateOrder(int id, UpdateOrderRequest request)
        {
            // Update main order
            SqlParameter[] orderParams = {
                new SqlParameter("@Id", id),
                new SqlParameter("@ThoiDiemRa", (object?)request.ThoiDiemRa ?? DBNull.Value),
                new SqlParameter("@IdNhanVien", (object?)request.IdNhanVien ?? DBNull.Value)
            };

            DataTable orderResult = _dbHelper.ExecuteStoredProcedure("sp_UpdateOrder", orderParams);
            bool success = orderResult.Rows.Count > 0 && Convert.ToInt32(orderResult.Rows[0]["RowsAffected"]) > 0;

            // Update order details if provided
            if (request.ChiTietHoaDonBan != null && success)
            {
                // Delete existing details
                SqlParameter[] deleteParams = { new SqlParameter("@IdHoaDonBan", id) };
                _dbHelper.ExecuteStoredProcedure("sp_DeleteOrderDetailsByOrderId", deleteParams);

                // Add new details
                foreach (var detail in request.ChiTietHoaDonBan)
                {
                    SqlParameter[] detailParams = {
                        new SqlParameter("@IdHoaDonBan", id),
                        new SqlParameter("@IdMonAn", detail.IdMonAn),
                        new SqlParameter("@SoLuong", detail.SoLuong)
                    };
                    _dbHelper.ExecuteStoredProcedure("sp_CreateOrderDetail", detailParams);
                }
            }

            return success;
        }

        public bool DeleteOrder(int id)
        {
            // Delete order details first
            SqlParameter[] deleteDetailsParams = { new SqlParameter("@IdHoaDonBan", id) };
            _dbHelper.ExecuteStoredProcedure("sp_DeleteOrderDetailsByOrderId", deleteDetailsParams);

            // Delete main order
            SqlParameter[] deleteOrderParams = { new SqlParameter("@Id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_DeleteOrder", deleteOrderParams);

            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
        }

        public bool UpdateOrderStatus(int id, UpdateOrderStatusRequest request)
        {
            SqlParameter[] parameters = {
                new SqlParameter("@Id", id),
                new SqlParameter("@TrangThaiHD", request.TrangThaiHD),
                new SqlParameter("@ThoiDiemRa", (object?)request.ThoiDiemRa ?? DBNull.Value)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_UpdateOrderStatus", parameters);
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
        }

        public List<OrderModel> GetOrdersByTableId(int tableId)
        {
            var orders = new List<OrderModel>();
            SqlParameter[] parameters = { new SqlParameter("@IdBanan", tableId) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetOrdersByTableId", parameters);

            foreach (DataRow row in dt.Rows)
            {
                var order = MapOrderFromDataRow(row);
                order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                orders.Add(order);
            }

            return orders;
        }

        private List<OrderDetailModel> GetOrderDetails(int orderId)
        {
            var details = new List<OrderDetailModel>();
            SqlParameter[] parameters = { new SqlParameter("@IdHoaDonBan", orderId) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetOrderDetails", parameters);

            foreach (DataRow row in dt.Rows)
            {
                details.Add(new OrderDetailModel
                {
                    IdHoaDonBan = Convert.ToInt32(row["idHoaDonBan"]),
                    IdMonAn = Convert.ToInt32(row["idMonAn"]),
                    SoLuong = Convert.ToInt32(row["soLuong"])
                });
            }

            return details;
        }

        private OrderModel MapOrderFromDataRow(DataRow row)
        {
            return new OrderModel
            {
                Id = Convert.ToInt32(row["id"]),
                ThoiDiemVao = Convert.ToDateTime(row["thoiDiemVao"]),
                ThoiDiemRa = row["thoiDiemRa"] == DBNull.Value ? null : Convert.ToDateTime(row["thoiDiemRa"]),
                IdBan = Convert.ToInt32(row["idBanan"]),
                TrangThaiHD = Convert.ToInt32(row["trangThaiHD"]),
                IdNhanVien = row["idNhanVien"] == DBNull.Value ? null : Convert.ToInt32(row["idNhanVien"]),
                ChiTietHoaDonBan = new List<OrderDetailModel>()
            };
        }
    }
}


