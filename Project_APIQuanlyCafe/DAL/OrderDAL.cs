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
        private readonly string _connectionString;
        
        public OrderDAL(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }
        
        // Lấy danh sách tất cả đơn hàng
        public List<OrderModel> GetAllOrders()
        {
            List<OrderModel> orders = new List<OrderModel>();
            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM HoaDonBan ORDER BY thoiDiemVao DESC";
                SqlCommand cmd = new SqlCommand(query, conn);
                
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                
                while (reader.Read())
                {
                    OrderModel order = new OrderModel
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        ThoiDiemVao = Convert.ToDateTime(reader["thoiDiemVao"]),
                        ThoiDiemRa = reader["thoiDiemRa"] as DateTime?,
                        IdBanAn = Convert.ToInt32(reader["idBanAn"]),
                        TrangThaiHD = Convert.ToInt32(reader["trangThaiHD"]),
                        IdNhanVien = reader["idNhanVien"] as int?
                    };
                    orders.Add(order);
                }
            }
            
            return orders;
        }
        
        // Lấy đơn hàng theo ID
        public OrderModel GetOrderById(int id)
        {
            OrderModel order = null;
            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM HoaDonBan WHERE id = @id";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@id", id);
                
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                
                if (reader.Read())
                {
                    order = new OrderModel
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        ThoiDiemVao = Convert.ToDateTime(reader["thoiDiemVao"]),
                        ThoiDiemRa = reader["thoiDiemRa"] as DateTime?,
                        IdBanAn = Convert.ToInt32(reader["idBanAn"]),
                        TrangThaiHD = Convert.ToInt32(reader["trangThaiHD"]),
                        IdNhanVien = reader["idNhanVien"] as int?
                    };
                }
            }
            
            // Lấy chi tiết đơn hàng nếu tồn tại
            if (order != null)
            {
                order.DetailOrders = GetDetailOrdersByOrderId(id);
            }
            
            return order;
        }
        
        // Lấy chi tiết đơn hàng
        public List<DetailOrderModel> GetDetailOrdersByOrderId(int orderId)
        {
            List<DetailOrderModel> details = new List<DetailOrderModel>();
            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM ChiTietHoaDonBan WHERE idHoaDonBan = @orderId";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@orderId", orderId);
                
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                
                while (reader.Read())
                {
                    DetailOrderModel detail = new DetailOrderModel
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        IdHoaDonBan = Convert.ToInt32(reader["idHoaDonBan"]),
                        IdMonAn = Convert.ToInt32(reader["idMonAn"]),
                        SoLuong = Convert.ToInt32(reader["soLuong"])
                    };
                    details.Add(detail);
                }
            }
            
            return details;
        }
        
        // Tạo đơn hàng mới
        public int CreateOrder(CreateOrderRequest request)
        {
            int orderId = 0;
            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlTransaction transaction = conn.BeginTransaction();
                
                try
                {
                    // Kiểm tra bàn ăn có tồn tại không
                    string checkTableQuery = "SELECT COUNT(1) FROM Ban WHERE id = @idBanAn";
                    SqlCommand checkTableCmd = new SqlCommand(checkTableQuery, conn, transaction);
                    checkTableCmd.Parameters.AddWithValue("@idBanAn", request.IdBanAn);
                    
                    int tableExists = (int)checkTableCmd.ExecuteScalar();
                    if (tableExists == 0)
                    {
                        throw new Exception($"Bàn ăn với ID {request.IdBanAn} không tồn tại trong hệ thống");
                    }
                    
                    // Tạo đơn hàng
                    string orderQuery = @"INSERT INTO HoaDonBan (thoiDiemVao, idBanAn, trangThaiHD, idNhanVien) 
                                         OUTPUT INSERTED.id 
                                         VALUES (@thoiDiemVao, @idBanAn, @trangThaiHD, @idNhanVien)";
                    
                    SqlCommand orderCmd = new SqlCommand(orderQuery, conn, transaction);
                    orderCmd.Parameters.AddWithValue("@thoiDiemVao", DateTime.Now);
                    orderCmd.Parameters.AddWithValue("@idBanAn", request.IdBanAn);
                    orderCmd.Parameters.AddWithValue("@trangThaiHD", 0);
                    orderCmd.Parameters.AddWithValue("@idNhanVien", (object)request.IdNhanVien ?? DBNull.Value);
                    
                    orderId = (int)orderCmd.ExecuteScalar();
                    
                    // Tạo chi tiết đơn hàng
                    foreach (var detail in request.DetailOrders)
                    {
                        string detailQuery = @"INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong) 
                                              VALUES (@idHoaDonBan, @idMonAn, @soLuong)";
                        
                        SqlCommand detailCmd = new SqlCommand(detailQuery, conn, transaction);
                        detailCmd.Parameters.AddWithValue("@idHoaDonBan", orderId);
                        detailCmd.Parameters.AddWithValue("@idMonAn", detail.IdMonAn);
                        detailCmd.Parameters.AddWithValue("@soLuong", detail.SoLuong);
                        
                        detailCmd.ExecuteNonQuery();
                    }
                    
                    transaction.Commit();
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
            
            return orderId;
        }
        
        // Cập nhật đơn hàng
        public bool UpdateOrder(int id, UpdateOrderRequest request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlTransaction transaction = conn.BeginTransaction();
                
                try
                {
                    // Cập nhật thông tin đơn hàng
                    string orderQuery = @"UPDATE HoaDonBan 
                                         SET thoiDiemRa = @thoiDiemRa, idNhanVien = @idNhanVien 
                                         WHERE id = @id";
                    
                    SqlCommand orderCmd = new SqlCommand(orderQuery, conn, transaction);
                    orderCmd.Parameters.AddWithValue("@id", id);
                    orderCmd.Parameters.AddWithValue("@thoiDiemRa", (object)request.ThoiDiemRa ?? DBNull.Value);
                    orderCmd.Parameters.AddWithValue("@idNhanVien", (object)request.IdNhanVien ?? DBNull.Value);
                    
                    int rowsAffected = orderCmd.ExecuteNonQuery();
                    
                    if (rowsAffected > 0 && request.DetailOrders.Count > 0)
                    {
                        // Xóa chi tiết đơn hàng cũ
                        string deleteDetailQuery = "DELETE FROM ChiTietHoaDonBan WHERE idHoaDonBan = @id";
                        SqlCommand deleteCmd = new SqlCommand(deleteDetailQuery, conn, transaction);
                        deleteCmd.Parameters.AddWithValue("@id", id);
                        deleteCmd.ExecuteNonQuery();
                        
                        // Thêm chi tiết đơn hàng mới
                        foreach (var detail in request.DetailOrders)
                        {
                            string detailQuery = @"INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong) 
                                                  VALUES (@idHoaDonBan, @idMonAn, @soLuong)";
                            
                            SqlCommand detailCmd = new SqlCommand(detailQuery, conn, transaction);
                            detailCmd.Parameters.AddWithValue("@idHoaDonBan", id);
                            detailCmd.Parameters.AddWithValue("@idMonAn", detail.IdMonAn);
                            detailCmd.Parameters.AddWithValue("@soLuong", detail.SoLuong);
                            
                            detailCmd.ExecuteNonQuery();
                        }
                    }
                    
                    transaction.Commit();
                    return rowsAffected > 0;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
        }
        
        // Xóa đơn hàng
        public bool DeleteOrder(int id)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                SqlTransaction transaction = conn.BeginTransaction();
                
                try
                {
                    // Xóa chi tiết đơn hàng trước
                    string deleteDetailQuery = "DELETE FROM ChiTietHoaDonBan WHERE idHoaDonBan = @id";
                    SqlCommand deleteDetailCmd = new SqlCommand(deleteDetailQuery, conn, transaction);
                    deleteDetailCmd.Parameters.AddWithValue("@id", id);
                    deleteDetailCmd.ExecuteNonQuery();
                    
                    // Xóa đơn hàng
                    string deleteOrderQuery = "DELETE FROM HoaDonBan WHERE id = @id";
                    SqlCommand deleteOrderCmd = new SqlCommand(deleteOrderQuery, conn, transaction);
                    deleteOrderCmd.Parameters.AddWithValue("@id", id);
                    
                    int rowsAffected = deleteOrderCmd.ExecuteNonQuery();
                    
                    transaction.Commit();
                    return rowsAffected > 0;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
        }
        
        // Cập nhật trạng thái đơn hàng
        public bool UpdateOrderStatus(int id, UpdateOrderStatusRequest request)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"UPDATE HoaDonBan 
                                SET trangThaiHD = @trangThaiHD, thoiDiemRa = @thoiDiemRa 
                                WHERE id = @id";
                
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@id", id);
                cmd.Parameters.AddWithValue("@trangThaiHD", request.TrangThaiHD);
                cmd.Parameters.AddWithValue("@thoiDiemRa", (object)request.ThoiDiemRa ?? DBNull.Value);
                
                conn.Open();
                int rowsAffected = cmd.ExecuteNonQuery();
                
                return rowsAffected > 0;
            }
        }
        
        // Lấy đơn hàng theo bàn
        public List<OrderModel> GetOrdersByTableId(int tableId)
        {
            List<OrderModel> orders = new List<OrderModel>();
            
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM HoaDonBan WHERE idBanAn = @tableId ORDER BY thoiDiemVao DESC";
                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@tableId", tableId);
                
                conn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                
                while (reader.Read())
                {
                    OrderModel order = new OrderModel
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        ThoiDiemVao = Convert.ToDateTime(reader["thoiDiemVao"]),
                        ThoiDiemRa = reader["thoiDiemRa"] as DateTime?,
                        IdBanAn = Convert.ToInt32(reader["idBanAn"]),
                        TrangThaiHD = Convert.ToInt32(reader["trangThaiHD"]),
                        IdNhanVien = reader["idNhanVien"] as int?
                    };
                    orders.Add(order);
                }
            }
            
            return orders;
        }
    }
}
