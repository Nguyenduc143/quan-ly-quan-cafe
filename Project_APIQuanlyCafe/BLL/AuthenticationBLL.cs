using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;
using DAL;
using System.ComponentModel.DataAnnotations;

namespace BLL
{
    public class AuthenticationBLL
    {
        private readonly AuthenticationDAL _authDal;

        public AuthenticationBLL(AuthenticationDAL authDal)
        {
            _authDal = authDal;
        }

        // Đăng ký tài khoản mới
        public RegisterResponse DangKyTaiKhoan(RegisterRequest request)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(request.tenDangNhap) ||
                    string.IsNullOrEmpty(request.tenHienThi) ||
                    string.IsNullOrEmpty(request.matKhau))
                {
                    return new RegisterResponse
                    {
                        success = false,
                        message = "Vui lòng nhập đầy đủ thông tin"
                    };
                }

                if (request.matKhau.Length < 6)
                {
                    return new RegisterResponse
                    {
                        success = false,
                        message = "Mật khẩu phải có ít nhất 6 ký tự"
                    };
                }

                // Tạo model từ request
                var taiKhoan = new AuthenticationModels
                {
                    tenDangNhap = request.tenDangNhap,
                    tenHienThi = request.tenHienThi,
                    matKhau = request.matKhau,
                    loaiTaiKhoan = request.loaiTaiKhoan,
                    idNhanVien = request.idNhanVien
                };

                // Thêm tài khoản
                int result = _authDal.ThemTaiKhoan(taiKhoan);
                if (result == -1)
                {
                    return new RegisterResponse
                    {
                        success = false,
                        message = "Tên đăng nhập đã tồn tại"
                    };
                }
                else if (result > 0)
                {
                    return new RegisterResponse
                    {
                        success = true,
                        message = "Đăng ký tài khoản thành công",
                        tenDangNhap = taiKhoan.tenDangNhap,
                        tenHienThi = taiKhoan.tenHienThi
                    };
                }
                else
                {
                    return new RegisterResponse
                    {
                        success = false,
                        message = "Đăng ký tài khoản thất bại"
                    };
                }
            }
            catch (Exception ex)
            {
                return new RegisterResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        // Đăng nhập
        public LoginResponse DangNhap(LoginRequest request)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(request.tenDangNhap) || string.IsNullOrEmpty(request.matKhau))
                {
                    return new LoginResponse
                    {
                        success = false,
                        message = "Tên đăng nhập và mật khẩu không được để trống"
                    };
                }

                // Thực hiện đăng nhập
                var taiKhoan = _authDal.DangNhap(request.tenDangNhap, request.matKhau);
                if (taiKhoan == null)
                {
                    return new LoginResponse
                    {
                        success = false,
                        message = "Tên đăng nhập hoặc mật khẩu không đúng"
                    };
                }

                return new LoginResponse
                {
                    success = true,
                    message = "Đăng nhập thành công",
                    tenDangNhap = taiKhoan.tenDangNhap,
                    tenHienThi = taiKhoan.tenHienThi,
                    loaiTaiKhoan = taiKhoan.loaiTaiKhoan,
                    idNhanVien = taiKhoan.idNhanVien,
                    token = GenerateToken(taiKhoan) // Tạo token đơn giản
                };
            }
            catch (Exception ex)
            {
                return new LoginResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        // Lấy thông tin người dùng hiện tại
        public LoginResponse GetCurrentUser(string tenDangNhap)
        {
            try
            {
                if (string.IsNullOrEmpty(tenDangNhap))
                {
                    return new LoginResponse
                    {
                        success = false,
                        message = "Tên đăng nhập không hợp lệ"
                    };
                }

                var taiKhoan = _authDal.GetTaiKhoanByTenDangNhap(tenDangNhap);
                if (taiKhoan == null)
                {
                    return new LoginResponse
                    {
                        success = false,
                        message = "Không tìm thấy thông tin tài khoản"
                    };
                }

                return new LoginResponse
                {
                    success = true,
                    message = "Lấy thông tin thành công",
                    tenDangNhap = taiKhoan.tenDangNhap,
                    tenHienThi = taiKhoan.tenHienThi,
                    loaiTaiKhoan = taiKhoan.loaiTaiKhoan,
                    idNhanVien = taiKhoan.idNhanVien
                };
            }
            catch (Exception ex)
            {
                return new LoginResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        // Đổi mật khẩu
        public BaseResponse DoiMatKhau(ChangePasswordRequest request)
        {
            try
            {
                // Kiểm tra dữ liệu đầu vào
                if (string.IsNullOrEmpty(request.tenDangNhap) ||
                    string.IsNullOrEmpty(request.matKhauCu) ||
                    string.IsNullOrEmpty(request.matKhauMoi))
                {
                    return new BaseResponse
                    {
                        success = false,
                        message = "Vui lòng nhập đầy đủ thông tin"
                    };
                }

                if (request.matKhauMoi.Length < 6)
                {
                    return new BaseResponse
                    {
                        success = false,
                        message = "Mật khẩu mới phải có ít nhất 6 ký tự"
                    };
                }

                // Kiểm tra mật khẩu cũ
                if (!_authDal.KiemTraMatKhauCu(request.tenDangNhap, request.matKhauCu))
                {
                    return new BaseResponse
                    {
                        success = false,
                        message = "Mật khẩu cũ không đúng"
                    };
                }

                // Đổi mật khẩu
                int result = _authDal.DoiMatKhau(request.tenDangNhap, request.matKhauMoi);
                if (result > 0)
                {
                    return new BaseResponse
                    {
                        success = true,
                        message = "Đổi mật khẩu thành công"
                    };
                }
                else
                {
                    return new BaseResponse
                    {
                        success = false,
                        message = "Đổi mật khẩu thất bại"
                    };
                }
            }
            catch (Exception ex)
            {
                return new BaseResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                };
            }
        }

        // Đăng xuất (đơn giản - chỉ trả về thông báo)
        public BaseResponse DangXuat()
        {
            return new BaseResponse
            {
                success = true,
                message = "Đăng xuất thành công"
            };
        }

        // Lấy danh sách tài khoản (chỉ admin)
        public List<AuthenticationModels> GetAllTaiKhoan()
        {
            try
            {
                return _authDal.GetAllTaiKhoan();
            }
            catch (Exception)
            {
                return new List<AuthenticationModels>();
            }
        }

        // Tạo token
        private string GenerateToken(AuthenticationModels taiKhoan)
        {
            var tokenData = $"{taiKhoan.tenDangNhap}_{DateTime.Now.Ticks}";
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(tokenData));
        }
    }
}
