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
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllInventory");

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
            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetInventoryById", parameters);

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
            SqlParameter[] parameters = {
                new SqlParameter("@tenNguyenLieu", request.TenNguyenLieu),
                new SqlParameter("@donViTinh", (object?)request.DonViTinh ?? DBNull.Value),
                new SqlParameter("@soLuongTon", request.SoLuongTon),
                new SqlParameter("@ghiChu", (object?)request.GhiChu ?? DBNull.Value)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CreateInventory", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public bool UpdateInventory(int id, UpdateInventoryRequest request)
        {
            SqlParameter[] parameters = {
                new SqlParameter("@id", id),
                new SqlParameter("@tenNguyenLieu", request.TenNguyenLieu),
                new SqlParameter("@donViTinh", (object?)request.DonViTinh ?? DBNull.Value),
                new SqlParameter("@soLuongTon", request.SoLuongTon),
                new SqlParameter("@ghiChu", (object?)request.GhiChu ?? DBNull.Value)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_UpdateInventory", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
            }
            return false;
        }

        public bool DeleteInventory(int id)
        {
            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_DeleteInventory", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
            }
            return false;
        }
    }
}
