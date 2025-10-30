using Models;
using System.Data.SqlClient;
using System.Data;

namespace DAL
{
    public class AuthenticationDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public AuthenticationDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Kiểm tra tài khoản đã tồn tại
        public bool IsTaiKhoanExists(string tenDangNhap)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CheckTaiKhoanExists", parameters);
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0;
        }

        // Thêm tài khoản mới
        public int ThemTaiKhoan(AuthenticationModels taiKhoan)
        {
            // Kiểm tra tài khoản đã tồn tại chưa
            if (IsTaiKhoanExists(taiKhoan.tenDangNhap))
                return -1; // Trả về -1 nếu trùng

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", taiKhoan.tenDangNhap),
                new SqlParameter("@tenHienThi", taiKhoan.tenHienThi),
                new SqlParameter("@matKhau", taiKhoan.matKhau),
                new SqlParameter("@loaiTaiKhoan", taiKhoan.loaiTaiKhoan),
                new SqlParameter("@idNhanVien", (object)taiKhoan.idNhanVien ?? DBNull.Value)
            };

            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_ThemTaiKhoan", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        // Kiểm tra đăng nhập
        public AuthenticationModels? DangNhap(string tenDangNhap, string matKhau)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", matKhau)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_DangNhap", parameters);
            if (dt.Rows.Count == 0) return null;

            var row = dt.Rows[0];
            return new AuthenticationModels
            {
                tenDangNhap = row["tenDangNhap"].ToString(),
                tenHienThi = row["tenHienThi"].ToString(),
                matKhau = row["matKhau"].ToString(),
                loaiTaiKhoan = Convert.ToInt32(row["loaiTaiKhoan"]),
                idNhanVien = row["idNhanVien"] as int?
            };
        }

        // Lấy thông tin tài khoản theo tên đăng nhập
        public AuthenticationModels? GetTaiKhoanByTenDangNhap(string tenDangNhap)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetTaiKhoanByTenDangNhap", parameters);
            if (dt.Rows.Count == 0) return null;

            var row = dt.Rows[0];
            return new AuthenticationModels
            {
                tenDangNhap = row["tenDangNhap"].ToString(),
                tenHienThi = row["tenHienThi"].ToString(),
                matKhau = row["matKhau"].ToString(),
                loaiTaiKhoan = Convert.ToInt32(row["loaiTaiKhoan"]),
                idNhanVien = row["idNhanVien"] as int?
            };
        }

        // Đổi mật khẩu
        public int DoiMatKhau(string tenDangNhap, string matKhauMoi)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", matKhauMoi)
            };

            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_DoiMatKhau", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        // Kiểm tra mật khẩu cũ
        public bool KiemTraMatKhauCu(string tenDangNhap, string matKhauCu)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", matKhauCu)
            };

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_KiemTraMatKhauCu", parameters);
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0;
        }

        // Lấy danh sách tất cả tài khoản
        public List<AuthenticationModels> GetAllTaiKhoan()
        {
            var list = new List<AuthenticationModels>();
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllTaiKhoan");
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new AuthenticationModels
                {
                    tenDangNhap = row["tenDangNhap"].ToString(),
                    tenHienThi = row["tenHienThi"].ToString(),
                    loaiTaiKhoan = Convert.ToInt32(row["loaiTaiKhoan"]),
                    idNhanVien = row["idNhanVien"] as int?
                });
            }
            return list;
        }
    }
}

