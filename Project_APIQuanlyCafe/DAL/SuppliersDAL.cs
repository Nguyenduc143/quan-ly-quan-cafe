using Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class SuppliersDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public SuppliersDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Sync methods
        public List<SupplierModel> GetAllSuppliers()
        {
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllSuppliers");

            List<SupplierModel> supplierList = new List<SupplierModel>();
            foreach (DataRow row in dt.Rows)
            {
                supplierList.Add(MapDataRowToSupplier(row));
            }
            return supplierList;
        }

        public SupplierModel? GetSupplierById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetSupplierById", parameters);

            if (dt.Rows.Count == 0)
                return null;

            return MapDataRowToSupplier(dt.Rows[0]);
        }

        public int CreateSupplier(CreateSupplierRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin nhà cung cấp không được để trống");

            if (string.IsNullOrWhiteSpace(request.TenNhaCungCap))
                throw new ArgumentException("Tên nhà cung cấp không được để trống");

            SqlParameter[] parameters = {
                new SqlParameter("@tenNhaCungCap", request.TenNhaCungCap),
                new SqlParameter("@diaChi", (object?)request.DiaChi ?? DBNull.Value),
                new SqlParameter("@sdt", (object?)request.Sdt ?? DBNull.Value),
                new SqlParameter("@email", (object?)request.Email ?? DBNull.Value)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CreateSupplierFromRequest", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public int CreateSupplier(SupplierModel supplier)
        {
            ValidateSupplier(supplier);

            SqlParameter[] parameters = GetSupplierParameters(supplier);
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CreateSupplier", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public bool UpdateSupplier(int id, SupplierModel supplier)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            ValidateSupplier(supplier);

            SqlParameter[] parameters = GetSupplierParameters(supplier);
            Array.Resize(ref parameters, parameters.Length + 1);
            parameters[parameters.Length - 1] = new SqlParameter("@id", id);

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_UpdateSupplier", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
            }
            return false;
        }

        public bool DeleteSupplier(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_DeleteSupplier", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["RowsAffected"]) > 0;
            }
            return false;
        }

        // Private helper methods
        private static SupplierModel MapDataRowToSupplier(DataRow row)
        {
            return new SupplierModel
            {
                Id = Convert.ToInt32(row["id"]),
                TenNhaCungCap = row["tenNhaCungCap"].ToString() ?? string.Empty,
                DiaChi = row["diaChi"] == DBNull.Value ? null : row["diaChi"].ToString(),
                Sdt = row["sdt"] == DBNull.Value ? null : row["sdt"].ToString(),
                Email = row["email"] == DBNull.Value ? null : row["email"].ToString()
            };
        }

        private static void ValidateSupplier(SupplierModel supplier)
        {
            if (supplier == null)
                throw new ArgumentNullException(nameof(supplier), "Thông tin nhà cung cấp không được để trống");

            if (string.IsNullOrWhiteSpace(supplier.TenNhaCungCap))
                throw new ArgumentException("Tên nhà cung cấp không được để trống");
        }

        private static SqlParameter[] GetSupplierParameters(SupplierModel supplier)
        {
            return new SqlParameter[]
            {
                new SqlParameter("@tenNhaCungCap", supplier.TenNhaCungCap),
                new SqlParameter("@diaChi", (object?)supplier.DiaChi ?? DBNull.Value),
                new SqlParameter("@sdt", (object?)supplier.Sdt ?? DBNull.Value),
                new SqlParameter("@email", (object?)supplier.Email ?? DBNull.Value)
            };
        }
    }
}


