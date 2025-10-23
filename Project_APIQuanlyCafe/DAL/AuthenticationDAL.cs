using Models;
using System.Data.SqlClient;
using System.Data;
using System.Security.Cryptography;
using System.Text;

namespace DAL
{
    public class AuthenticationDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public AuthenticationDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        // Hàm mã hóa mật khẩu
        private string HashPassword(string password)
        {
            return password; // Chưa mã hóa, chỉ để nguyên mật khẩu (không an toàn)
            //using (SHA256 sha256Hash = SHA256.Create())
            //{
            //    byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
            //    StringBuilder builder = new StringBuilder();
            //    for (int i = 0; i < bytes.Length; i++)
            //    {
            //        builder.Append(bytes[i].ToString("x2"));
            //    }
            //    return builder.ToString();
            //}
        }

        // Kiểm tra tài khoản đã tồn tại
        public bool IsTaiKhoanExists(string tenDangNhap)
        {
            var sql = "SELECT COUNT(1) FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap)
            };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0;
        }

        // Thêm tài khoản mới
        public int ThemTaiKhoan(AuthenticationModels taiKhoan)
        {
            // Kiểm tra tài khoản đã tồn tại chưa
            if (IsTaiKhoanExists(taiKhoan.tenDangNhap))
                return -1; // Trả về -1 nếu trùng

            string hashedPassword = HashPassword(taiKhoan.matKhau);
            var sql = "INSERT INTO TaiKhoan (tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien) VALUES (@tenDangNhap, @tenHienThi, @matKhau, @loaiTaiKhoan, @idNhanVien)";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", taiKhoan.tenDangNhap),
                new SqlParameter("@tenHienThi", taiKhoan.tenHienThi),
                new SqlParameter("@matKhau", hashedPassword),
                new SqlParameter("@loaiTaiKhoan", taiKhoan.loaiTaiKhoan),
                new SqlParameter("@idNhanVien", (object)taiKhoan.idNhanVien ?? DBNull.Value)
            };

            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

        // Kiểm tra đăng nhập
        public AuthenticationModels? DangNhap(string tenDangNhap, string matKhau)
        {
            string hashedPassword = HashPassword(matKhau);
            var sql = "SELECT tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap AND matKhau = @matKhau";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", hashedPassword)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
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
            var sql = "SELECT tenDangNhap, tenHienThi, matKhau, loaiTaiKhoan, idNhanVien FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
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
            string hashedPassword = HashPassword(matKhauMoi);
            var sql = "UPDATE TaiKhoan SET matKhau = @matKhau WHERE tenDangNhap = @tenDangNhap";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", hashedPassword)
            };

            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

        // Kiểm tra mật khẩu cũ
        public bool KiemTraMatKhauCu(string tenDangNhap, string matKhauCu)
        {
            string hashedPassword = HashPassword(matKhauCu);
            var sql = "SELECT COUNT(1) FROM TaiKhoan WHERE tenDangNhap = @tenDangNhap AND matKhau = @matKhau";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDangNhap", tenDangNhap),
                new SqlParameter("@matKhau", hashedPassword)
            };

            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0;
        }

        // Lấy danh sách tất cả tài khoản
        public List<AuthenticationModels> GetAllTaiKhoan()
        {
            var list = new List<AuthenticationModels>();
            var sql = "SELECT tenDangNhap, tenHienThi, loaiTaiKhoan, idNhanVien FROM TaiKhoan";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
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
