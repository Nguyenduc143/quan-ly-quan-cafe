using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;
using DAL;

namespace API.Authentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly AuthenticationBLL _authBll;

        public AuthenticationController(AuthenticationBLL authBll)
        {
            _authBll = authBll;
        }

        /// <summary>
        /// Đăng nhập vào hệ thống
        /// </summary>
        /// <param name="request">Thông tin đăng nhập</param>
        /// <returns>Kết quả đăng nhập</returns>
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new LoginResponse
                    {
                        success = false,
                        message = "Dữ liệu đầu vào không hợp lệ"
                    });
                }

                var result = _authBll.DangNhap(request);

                if (result.success)
                {
                    // Lưu thông tin đăng nhập vào session
                    HttpContext.Session.SetString("TenDangNhap", result.tenDangNhap);
                    HttpContext.Session.SetString("TenHienThi", result.tenHienThi);
                    HttpContext.Session.SetInt32("LoaiTaiKhoan", result.loaiTaiKhoan);
                    if (result.idNhanVien.HasValue)
                    {
                        HttpContext.Session.SetInt32("IdNhanVien", result.idNhanVien.Value);
                    }

                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Đăng xuất khỏi hệ thống
        /// </summary>
        /// <returns>Kết quả đăng xuất</returns>
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            try
            {
                // Xoá session
                HttpContext.Session.Clear();

                var result = _authBll.DangXuat();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BaseResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy thông tin người dùng hiện tại
        /// </summary>
        /// <returns>Thông tin người dùng</returns>
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            try
            {
                var tenDangNhap = HttpContext.Session.GetString("TenDangNhap");

                if (string.IsNullOrEmpty(tenDangNhap))
                {
                    return Unauthorized(new LoginResponse
                    {
                        success = false,
                        message = "Bạn chưa đăng nhập"
                    });
                }

                var result = _authBll.GetCurrentUser(tenDangNhap);

                if (result.success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Đổi mật khẩu
        /// </summary>
        /// <param name="request">Thông tin đổi mật khẩu</param>
        /// <returns>Kết quả đổi mật khẩu</returns>
        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new BaseResponse
                    {
                        success = false,
                        message = "Dữ liệu đầu vào không hợp lệ"
                    });
                }

                // Kiểm tra xem user có đăng nhập không
                var tenDangNhapSession = HttpContext.Session.GetString("TenDangNhap");
                if (string.IsNullOrEmpty(tenDangNhapSession))
                {
                    return Unauthorized(new BaseResponse
                    {
                        success = false,
                        message = "Bạn chưa đăng nhập"
                    });
                }

                // Kiểm tra xem user có quyền đổi mật khẩu tài khoản này không
                if (tenDangNhapSession != request.tenDangNhap)
                {
                    return Forbid("Bạn không có quyền đổi mật khẩu tài khoản này");
                }

                var result = _authBll.DoiMatKhau(request);

                if (result.success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BaseResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Thêm tài khoản mới (chỉ admin)
        /// </summary>
        /// <param name="request">Thông tin tài khoản mới</param>
        /// <returns>Kết quả thêm tài khoản</returns>
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new RegisterResponse
                    {
                        success = false,
                        message = "Dữ liệu đầu vào không hợp lệ"
                    });
                }

                // Kiểm tra quyền admin (nếu cần)
                var loaiTaiKhoanSession = HttpContext.Session.GetInt32("LoaiTaiKhoan");
                if (!loaiTaiKhoanSession.HasValue || loaiTaiKhoanSession.Value != 1)
                {
                    return Forbid("Chỉ admin mới có quyền tạo tài khoản mới");
                }

                var result = _authBll.DangKyTaiKhoan(request);

                if (result.success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new RegisterResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Kiểm tra trạng thái đăng nhập
        /// </summary>
        /// <returns>Trạng thái đăng nhập</returns>
        [HttpGet("status")]
        public IActionResult GetLoginStatus()
        {
            try
            {
                var tenDangNhap = HttpContext.Session.GetString("TenDangNhap");
                var tenHienThi = HttpContext.Session.GetString("TenHienThi");
                var loaiTaiKhoan = HttpContext.Session.GetInt32("LoaiTaiKhoan");
                var idNhanVien = HttpContext.Session.GetInt32("IdNhanVien");

                if (!string.IsNullOrEmpty(tenDangNhap))
                {
                    return Ok(new LoginResponse
                    {
                        success = true,
                        message = "Đã đăng nhập",
                        tenDangNhap = tenDangNhap,
                        tenHienThi = tenHienThi,
                        loaiTaiKhoan = loaiTaiKhoan ?? 0,
                        idNhanVien = idNhanVien
                    });
                }
                else
                {
                    return Ok(new LoginResponse
                    {
                        success = false,
                        message = "Chưa đăng nhập"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BaseResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }

        /// <summary>
        /// Lấy danh sách tài khoản (chỉ admin)
        /// </summary>
        /// <returns>Danh sách tài khoản</returns>
        [HttpGet("accounts")]
        public IActionResult GetAllAccounts()
        {
            try
            {
                // Kiểm tra quyền admin
                var loaiTaiKhoanSession = HttpContext.Session.GetInt32("LoaiTaiKhoan");
                if (!loaiTaiKhoanSession.HasValue || loaiTaiKhoanSession.Value != 1)
                {
                    return Forbid("Chỉ admin mới có quyền xem danh sách tài khoản");
                }

                var accounts = _authBll.GetAllTaiKhoan();
                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách tài khoản thành công",
                    data = accounts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new BaseResponse
                {
                    success = false,
                    message = "Lỗi hệ thống: " + ex.Message
                });
            }
        }
    }
}
