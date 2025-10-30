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
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", tenBan)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CheckTenBanExists", parameters);
            if (dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0)
                return true;
            return false;
        }

        public List<BanModels> GetAllBan()
        {
            var list = new List<BanModels>();
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllBan");
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

        public List<BanModels> GetBanByTrangThai(string trangThai)
        {
            if (!IsValidTrangThai(trangThai))
                return new List<BanModels>();

            var list = new List<BanModels>();
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TRANGTHAI", trangThai)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetBanByTrangThai", parameters);
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
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetBanById", parameters);
            if (dt.Rows.Count == 0) return null;
            var row = dt.Rows[0];
            return new BanModels
            {
                ID = row["ID"] as int?,
                TENBAN = row["TENBAN"].ToString(),
                TRANGTHAI = row["TRANGTHAI"].ToString()
            };
        }

        public int ThemBan(BanModels ban)
        {
            // Validate TENBAN and TRANGTHAI
            if (!IsValidTenBan(ban.TENBAN) || !IsValidTrangThai(ban.TRANGTHAI))
                return -2; // Invalid input

            if (IsTenBanExists(ban.TENBAN))
                return -1; // Duplicate

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", ban.TENBAN),
                new SqlParameter("@TRANGTHAI", ban.TRANGTHAI)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_ThemBan", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public int CapNhatBan(BanModels ban)
        {
            // Validate TENBAN and TRANGTHAI
            if (!IsValidTenBan(ban.TENBAN) || !IsValidTrangThai(ban.TRANGTHAI))
                return -2; // Invalid input

            // Check for duplicate TENBAN with another ID
            var parametersCheck = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", ban.TENBAN),
                new SqlParameter("@ID", ban.ID)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CheckTenBanExistsForUpdate", parametersCheck);
            if (dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0)
                return -1; // Duplicate name

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", ban.ID),
                new SqlParameter("@TENBAN", ban.TENBAN),
                new SqlParameter("@TRANGTHAI", ban.TRANGTHAI)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_CapNhatBan", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        public int CapNhatTrangThaiBan(int id, string trangThai)
        {
            // Validate TRANGTHAI
            if (!IsValidTrangThai(trangThai))
                return -2; // Invalid input

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id),
                new SqlParameter("@TRANGTHAI", trangThai)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_CapNhatTrangThaiBan", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        public int XoaBan(int id)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_XoaBan", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }
    }
}
