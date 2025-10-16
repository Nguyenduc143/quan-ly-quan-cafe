using Models;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace DAL
{
    public class BanDAL
    {
        private readonly DatabaseHelper _dbHelper;
        private const int MaxLength = 100;

        public BanDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        private bool IsValidTenBan(string tenBan)
        {
            if (string.IsNullOrWhiteSpace(tenBan) || tenBan.Length > MaxLength)
                return false;
            // Only letters, numbers, and spaces allowed
            return Regex.IsMatch(tenBan, @"^[\p{L}\p{N} ]+$");
        }

        private bool IsValidTrangThai(string trangThai)
        {
            if (string.IsNullOrWhiteSpace(trangThai) || trangThai.Length > MaxLength)
                return false;
            // Chỉ cho phép chữ, số và khoảng trắng
            return Regex.IsMatch(trangThai, @"^[\p{L}\p{N} ]+$");
        }

        public bool IsTenBanExists(string tenBan)
        {
            var sql = "SELECT COUNT(1) FROM Ban WHERE TENBAN = @TENBAN";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", tenBan)
            };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            if (dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0)
                return true;
            return false;
        }

        public int ThemBan(BanModels ban)
        {
            // Validate TENBAN and TRANGTHAI
            if (!IsValidTenBan(ban.TENBAN) || !IsValidTrangThai(ban.TRANGTHAI))
                return -2; // Invalid input

            if (IsTenBanExists(ban.TENBAN))
                return -1; // Duplicate

            var sql = "INSERT INTO Ban (TENBAN, TRANGTHAI) VALUES (@TENBAN, @TRANGTHAI)";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", ban.TENBAN),
                new SqlParameter("@TRANGTHAI", ban.TRANGTHAI)
            };

            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }

        public List<BanModels> GetAllBan()
        {
            var list = new List<BanModels>();
            var sql = "SELECT ID, TENBAN, TRANGTHAI FROM Ban";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new BanModels
                {
                    ID = row["ID"] as int?,
                    TENBAN = row["TENBAN"].ToString(),
                    TRANGTHAI = row["TRANGTHAI"].ToString()
                });
            }
            return list;
        }

        public BanModels? GetBanById(int id)
        {
            var sql = "SELECT ID, TENBAN, TRANGTHAI FROM Ban WHERE ID = @ID";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id)
            };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            if (dt.Rows.Count == 0) return null;
            var row = dt.Rows[0];
            return new BanModels
            {
                ID = row["ID"] as int?,
                TENBAN = row["TENBAN"].ToString(),
                TRANGTHAI = row["TRANGTHAI"].ToString()
            };
        }

        public int CapNhatBan(BanModels ban)
        {
            // Validate TENBAN and TRANGTHAI
            if (!IsValidTenBan(ban.TENBAN) || !IsValidTrangThai(ban.TRANGTHAI))
                return -2; // Invalid input

            // Check for duplicate TENBAN with another ID
            var sqlCheck = "SELECT COUNT(1) FROM Ban WHERE TENBAN = @TENBAN AND ID <> @ID";
            var parametersCheck = new SqlParameter[]
            {
        new SqlParameter("@TENBAN", ban.TENBAN),
        new SqlParameter("@ID", ban.ID)
            };
            DataTable dt = _dbHelper.ExecuteQuery(sqlCheck, parametersCheck);
            if (dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0)
                return -1; // Duplicate name

            var sql = "UPDATE Ban SET TENBAN = @TENBAN, TRANGTHAI = @TRANGTHAI WHERE ID = @ID";
            var parameters = new SqlParameter[]
            {
        new SqlParameter("@ID", ban.ID),
        new SqlParameter("@TENBAN", ban.TENBAN),
        new SqlParameter("@TRANGTHAI", ban.TRANGTHAI)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }


        public int CapNhatTrangThaiBan(int id, string trangThai)
        {
            // Validate TRANGTHAI
            if (!IsValidTrangThai(trangThai))
                return -2; // Invalid input

            var sql = "UPDATE Ban SET TRANGTHAI = @TRANGTHAI WHERE ID = @ID";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id),
                new SqlParameter("@TRANGTHAI", trangThai)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

        public int XoaBan(int id)
        {
            // No validation needed for delete, but you can add checks if required
            var sql = "DELETE FROM Ban WHERE ID = @ID";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

    }
}
