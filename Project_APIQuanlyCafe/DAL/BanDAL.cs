using Models;
using System.Data.SqlClient;
using System.Data;
using System.Collections.Generic;

namespace DAL
{
    public class BanDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public BanDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Hàm kiểm tra TENBAN đã tồn tại
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
            // Kiểm tra TENBAN đã tồn tại chưa
            if (IsTenBanExists(ban.TENBAN))
                return -1; // Trả về -1 nếu trùng

            // Bỏ cột ID khỏi INSERT vì là identity column (tự động tăng)
            var sql = "INSERT INTO Ban (TENBAN, TRANGTHAI) VALUES (@TENBAN, @TRANGTHAI)";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@TENBAN", ban.TENBAN),
                new SqlParameter("@TRANGTHAI", ban.TRANGTHAI)
            };

            // Trả về ID vừa được tạo
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
            var sql = "DELETE FROM Ban WHERE ID = @ID";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@ID", id)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

    }
}
