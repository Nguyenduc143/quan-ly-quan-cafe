using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;

namespace DAL
{
    public class InventoryDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public InventoryDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public List<InventoryModel> GetAllInventory()
        {
            string sql = "SELECT id, tenNguyenLieu, donViTinh, soLuongTon, ghiChu FROM KhoNguyenLieu ORDER BY tenNguyenLieu";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
            
            List<InventoryModel> inventoryList = new List<InventoryModel>();
            foreach (DataRow row in dt.Rows)
            {
                inventoryList.Add(new InventoryModel
                {
                    Id = Convert.ToInt32(row["id"]),
                    TenNguyenLieu = row["tenNguyenLieu"].ToString() ?? string.Empty,
                    DonViTinh = row["donViTinh"] == DBNull.Value ? null : row["donViTinh"].ToString(),
                    SoLuongTon = Convert.ToDouble(row["soLuongTon"]),
                    GhiChu = row["ghiChu"] == DBNull.Value ? null : row["ghiChu"].ToString()
                });
            }
            return inventoryList;
        }

        public InventoryModel? GetInventoryById(int id)
        {
            string sql = "SELECT id, tenNguyenLieu, donViTinh, soLuongTon, ghiChu FROM KhoNguyenLieu WHERE id = @id";
            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            
            if (dt.Rows.Count > 0)
            {
                DataRow row = dt.Rows[0];
                return new InventoryModel
                {
                    Id = Convert.ToInt32(row["id"]),
                    TenNguyenLieu = row["tenNguyenLieu"].ToString() ?? string.Empty,
                    DonViTinh = row["donViTinh"] == DBNull.Value ? null : row["donViTinh"].ToString(),
                    SoLuongTon = Convert.ToDouble(row["soLuongTon"]),
                    GhiChu = row["ghiChu"] == DBNull.Value ? null : row["ghiChu"].ToString()
                };
            }
            return null;
        }

        public int CreateInventory(CreateInventoryRequest request)
        {
            string sql = "INSERT INTO KhoNguyenLieu (tenNguyenLieu, donViTinh, soLuongTon, ghiChu) VALUES (@tenNguyenLieu, @donViTinh, @soLuongTon, @ghiChu)";
            SqlParameter[] parameters = {
                new SqlParameter("@tenNguyenLieu", request.TenNguyenLieu),
                new SqlParameter("@donViTinh", (object?)request.DonViTinh ?? DBNull.Value),
                new SqlParameter("@soLuongTon", request.SoLuongTon),
                new SqlParameter("@ghiChu", (object?)request.GhiChu ?? DBNull.Value)
            };
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }

        public bool UpdateInventory(int id, UpdateInventoryRequest request)
        {
            string sql = "UPDATE KhoNguyenLieu SET tenNguyenLieu = @tenNguyenLieu, donViTinh = @donViTinh, soLuongTon = @soLuongTon, ghiChu = @ghiChu WHERE id = @id";
            SqlParameter[] parameters = {
                new SqlParameter("@id", id),
                new SqlParameter("@tenNguyenLieu", request.TenNguyenLieu),
                new SqlParameter("@donViTinh", (object?)request.DonViTinh ?? DBNull.Value),
                new SqlParameter("@soLuongTon", request.SoLuongTon),
                new SqlParameter("@ghiChu", (object?)request.GhiChu ?? DBNull.Value)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters) > 0;
        }

        public bool DeleteInventory(int id)
        {
            string sql = "DELETE FROM KhoNguyenLieu WHERE id = @id";
            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            return _dbHelper.ExecuteNonQuery(sql, parameters) > 0;
        }

        public List<SupplierModel> GetAllSuppliers()
        {
            string sql = "SELECT id, tenNhaCungCap, diaChi, sdt, email FROM NhaCungCap ORDER BY tenNhaCungCap";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
            
            List<SupplierModel> supplierList = new List<SupplierModel>();
            foreach (DataRow row in dt.Rows)
            {
                supplierList.Add(new SupplierModel
                {
                    Id = Convert.ToInt32(row["id"]),
                    TenNhaCungCap = row["tenNhaCungCap"].ToString() ?? string.Empty,
                    DiaChi = row["diaChi"] == DBNull.Value ? null : row["diaChi"].ToString(),
                    Sdt = row["sdt"] == DBNull.Value ? null : row["sdt"].ToString(),
                    Email = row["email"] == DBNull.Value ? null : row["email"].ToString()
                });
            }
            return supplierList;
        }

        public int CreateSupplier(CreateSupplierRequest request)
        {
            string sql = "INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) VALUES (@tenNhaCungCap, @diaChi, @sdt, @email)";
            SqlParameter[] parameters = {
                new SqlParameter("@tenNhaCungCap", request.TenNhaCungCap),
                new SqlParameter("@diaChi", (object?)request.DiaChi ?? DBNull.Value),
                new SqlParameter("@sdt", (object?)request.Sdt ?? DBNull.Value),
                new SqlParameter("@email", (object?)request.Email ?? DBNull.Value)
            };
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }
    }
}
