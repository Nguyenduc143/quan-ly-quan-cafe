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
            string sql = "SELECT id, tenNhaCungCap, diaChi, sdt, email FROM NhaCungCap ORDER BY tenNhaCungCap";
            DataTable dt = _dbHelper.ExecuteQuery(sql);

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

            string sql = "SELECT id, tenNhaCungCap, diaChi, sdt, email FROM NhaCungCap WHERE id = @id";
            SqlParameter[] parameters = { new SqlParameter("@id", id) };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);

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

            string sql = "INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) VALUES (@tenNhaCungCap, @diaChi, @sdt, @email)";
            SqlParameter[] parameters = {
                new SqlParameter("@tenNhaCungCap", request.TenNhaCungCap),
                new SqlParameter("@diaChi", (object?)request.DiaChi ?? DBNull.Value),
                new SqlParameter("@sdt", (object?)request.Sdt ?? DBNull.Value),
                new SqlParameter("@email", (object?)request.Email ?? DBNull.Value)
            };
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }

        public int CreateSupplier(SupplierModel supplier)
        {
            ValidateSupplier(supplier);

            string sql = "INSERT INTO NhaCungCap (tenNhaCungCap, diaChi, sdt, email) VALUES (@tenNhaCungCap, @diaChi, @sdt, @email)";
            SqlParameter[] parameters = GetSupplierParameters(supplier);
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }

        public bool UpdateSupplier(int id, SupplierModel supplier)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            ValidateSupplier(supplier);

            string sql = "UPDATE NhaCungCap SET tenNhaCungCap = @tenNhaCungCap, diaChi = @diaChi, sdt = @sdt, email = @email WHERE id = @id";
            SqlParameter[] parameters = GetSupplierParameters(supplier);
            Array.Resize(ref parameters, parameters.Length + 1);
            parameters[parameters.Length - 1] = new SqlParameter("@id", id);

            int rowsAffected = _dbHelper.ExecuteNonQuery(sql, parameters);
            return rowsAffected > 0;
        }

        public bool DeleteSupplier(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            string sql = "DELETE FROM NhaCungCap WHERE id = @id";
            SqlParameter[] parameters = { new SqlParameter("@id", id) };

            int rowsAffected = _dbHelper.ExecuteNonQuery(sql, parameters);
            return rowsAffected > 0;
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
