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

        public List<OrderModel> GetAllOrders()
        {
            var orders = new List<OrderModel>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM HoaDonBan", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var order = MapOrder(reader);
                        order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                        orders.Add(order);
                    }
                }
            }
            return orders;
        }

        public OrderModel GetOrderById(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM HoaDonBan WHERE id = @Id", conn))
            {
                cmd.Parameters.AddWithValue("@Id", id);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        var order = MapOrder(reader);
                        order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                        return order;
                    }
                }
            }
            return null;
        }

        public int CreateOrder(CreateOrderRequest request)
        {
            int newOrderId;
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (var tran = conn.BeginTransaction())
                {
                    using (var cmd = new SqlCommand(
                        @"INSERT INTO HoaDonBan (thoiDiemVao, idBanan, trangThaiHD, idNhanVien) 
                          OUTPUT INSERTED.id
                          VALUES (@ThoiDiemVao, @IdBanan, @TrangThaiHD, @IdNhanVien)", conn, tran))
                    {
                        cmd.Parameters.AddWithValue("@ThoiDiemVao", DateTime.Now);
                        cmd.Parameters.AddWithValue("@IdBanan", request.IdBan);
                        cmd.Parameters.AddWithValue("@TrangThaiHD", 0);
                        cmd.Parameters.AddWithValue("@IdNhanVien", (object?)request.IdNhanVien ?? DBNull.Value);

                        newOrderId = (int)cmd.ExecuteScalar();
                    }

                    foreach (var detail in request.ChiTietHoaDonBan)
                    {
                        using (var cmdDetail = new SqlCommand(
                            @"INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong)
                              VALUES (@IdHoaDonBan, @IdMonAn, @SoLuong)", conn, tran))
                        {
                            cmdDetail.Parameters.AddWithValue("@IdHoaDonBan", newOrderId);
                            cmdDetail.Parameters.AddWithValue("@IdMonAn", detail.IdMonAn);
                            cmdDetail.Parameters.AddWithValue("@SoLuong", detail.SoLuong);
                            cmdDetail.ExecuteNonQuery();
                        }
                    }
                    tran.Commit();
                }
            }
            return newOrderId;
        }

        public bool UpdateOrder(int id, UpdateOrderRequest request)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (var tran = conn.BeginTransaction())
                {
                    using (var cmd = new SqlCommand(
                        @"UPDATE HoaDonBan SET 
                            thoiDiemRa = @ThoiDiemRa,
                            idNhanVien = @IdNhanVien
                          WHERE id = @Id", conn, tran))
                    {
                        cmd.Parameters.AddWithValue("@ThoiDiemRa", (object?)request.ThoiDiemRa ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@IdNhanVien", (object?)request.IdNhanVien ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Id", id);
                        cmd.ExecuteNonQuery();
                    }

                    if (request.ChiTietHoaDonBan != null)
                    {
                        using (var cmdDel = new SqlCommand(
                            "DELETE FROM ChiTietHoaDonBan WHERE idHoaDonBan = @IdHoaDonBan", conn, tran))
                        {
                            cmdDel.Parameters.AddWithValue("@IdHoaDonBan", id);
                            cmdDel.ExecuteNonQuery();
                        }
                        foreach (var detail in request.ChiTietHoaDonBan)
                        {
                            using (var cmdDetail = new SqlCommand(
                                @"INSERT INTO ChiTietHoaDonBan (idHoaDonBan, idMonAn, soLuong)
                                  VALUES (@IdHoaDonBan, @IdMonAn, @SoLuong)", conn, tran))
                            {
                                cmdDetail.Parameters.AddWithValue("@IdHoaDonBan", id);
                                cmdDetail.Parameters.AddWithValue("@IdMonAn", detail.IdMonAn);
                                cmdDetail.Parameters.AddWithValue("@SoLuong", detail.SoLuong);
                                cmdDetail.ExecuteNonQuery();
                            }
                        }
                    }
                    tran.Commit();
                }
            }
            return true;
        }

        public bool DeleteOrder(int id)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (var tran = conn.BeginTransaction())
                {
                    using (var cmdDetail = new SqlCommand(
                        "DELETE FROM ChiTietHoaDonBan WHERE idHoaDonBan = @Id", conn, tran))
                    {
                        cmdDetail.Parameters.AddWithValue("@Id", id);
                        cmdDetail.ExecuteNonQuery();
                    }
                    using (var cmd = new SqlCommand(
                        "DELETE FROM HoaDonBan WHERE id = @Id", conn, tran))
                    {
                        cmd.Parameters.AddWithValue("@Id", id);
                        var result = cmd.ExecuteNonQuery() > 0;
                        tran.Commit();
                        return result;
                    }
                }
            }
        }

        public bool UpdateOrderStatus(int id, UpdateOrderStatusRequest request)
        {
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(
                @"UPDATE HoaDonBan SET 
                    trangThaiHD = @TrangThaiHD,
                    thoiDiemRa = @ThoiDiemRa
                  WHERE id = @Id", conn))
            {
                cmd.Parameters.AddWithValue("@TrangThaiHD", request.TrangThaiHD);
                cmd.Parameters.AddWithValue("@ThoiDiemRa", (object?)request.ThoiDiemRa ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@Id", id);

                conn.Open();
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public List<OrderModel> GetOrdersByTableId(int tableId)
        {
            var orders = new List<OrderModel>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM HoaDonBan WHERE idBanan = @IdBanan", conn))
            {
                cmd.Parameters.AddWithValue("@IdBanan", tableId);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var order = MapOrder(reader);
                        order.ChiTietHoaDonBan = GetOrderDetails(order.Id);
                        orders.Add(order);
                    }
                }
            }
            return orders;
        }

        private List<OrderDetailModel> GetOrderDetails(int orderId)
        {
            var details = new List<OrderDetailModel>();
            using (var conn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand("SELECT * FROM ChiTietHoaDonBan WHERE idHoaDonBan = @IdHoaDonBan", conn))
            {
                cmd.Parameters.AddWithValue("@IdHoaDonBan", orderId);
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        details.Add(new OrderDetailModel
                        {
                            IdHoaDonBan = reader.GetInt32(reader.GetOrdinal("idHoaDonBan")),
                            IdMonAn = reader.GetInt32(reader.GetOrdinal("idMonAn")),
                            SoLuong = reader.GetInt32(reader.GetOrdinal("soLuong"))
                        });
                    }
                }
            }
            return details;
        }


        private OrderModel MapOrder(SqlDataReader reader)
        {
            return new OrderModel
            {
                Id = reader.GetInt32(reader.GetOrdinal("id")),
                ThoiDiemVao = reader.GetDateTime(reader.GetOrdinal("thoiDiemVao")),
                ThoiDiemRa = reader.IsDBNull(reader.GetOrdinal("thoiDiemRa")) ? null : reader.GetDateTime(reader.GetOrdinal("thoiDiemRa")),
                IdBan = reader.GetInt32(reader.GetOrdinal("idBanan")),
                TrangThaiHD = reader.GetInt32(reader.GetOrdinal("trangThaiHD")),
                IdNhanVien = reader.IsDBNull(reader.GetOrdinal("idNhanVien")) ? null : reader.GetInt32(reader.GetOrdinal("idNhanVien")),
                ChiTietHoaDonBan = new List<OrderDetailModel>()
            };
        }
    }
}
