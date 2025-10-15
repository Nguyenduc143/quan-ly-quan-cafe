using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace Models
{
    public class AuthenticationModels
    {
        public string tenDangNhap { get; set; }
        public string tenHienThi { get; set; }
        public string matKhau { get; set; }
        public int loaiTaiKhoan { get; set; }
        public int? idNhanVien { get; set; }
    }

    // DTO for login request
    public class LoginRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string tenDangNhap { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string matKhau { get; set; }
    }

    // DTO for register request
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        [StringLength(100, ErrorMessage = "Tên đăng nhập không được quá 100 ký tự")]
        public string tenDangNhap { get; set; }

        [Required(ErrorMessage = "Tên hiển thị không được để trống")]
        [StringLength(100, ErrorMessage = "Tên hiển thị không được quá 100 ký tự")]
        public string tenHienThi { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string matKhau { get; set; }

        [Required(ErrorMessage = "Loại tài khoản không được để trống")]
        [Range(0, 1, ErrorMessage = "Loại tài khoản phải là 0 (nhân viên) hoặc 1 (admin)")]
        public int loaiTaiKhoan { get; set; }

        public int? idNhanVien { get; set; }
    }

    // DTO for login response
    public class LoginResponse
    {
        public bool success { get; set; }
        public string message { get; set; }
        public string tenDangNhap { get; set; }
        public string tenHienThi { get; set; }
        public int loaiTaiKhoan { get; set; }
        public int? idNhanVien { get; set; }
        public string token { get; set; }
    }

    // DTO for change password request
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
        public string tenDangNhap { get; set; }

        [Required(ErrorMessage = "Mật khẩu cũ không được để trống")]
        public string matKhauCu { get; set; }

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
        public string matKhauMoi { get; set; }
    }

    // Base response class
    public class BaseResponse
    {
        public bool success { get; set; }
        public string message { get; set; }
    }

    // Response for register
    public class RegisterResponse
    {
        public bool success { get; set; }
        public string message { get; set; }
        public string tenDangNhap { get; set; }
        public string tenHienThi { get; set; }
    }
}
