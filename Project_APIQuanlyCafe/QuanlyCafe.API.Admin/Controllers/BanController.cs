using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BanController : ControllerBase
    {
        private readonly BanBLL _banBll;

        public BanController(BanBLL banBll)
        {
            _banBll = banBll;
        }
        [HttpGet]
        public IActionResult GetAllBan()
        {
            var result = _banBll.GetAllBan();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public IActionResult GetBanById(int id)
        {
            var ban = _banBll.GetBanById(id);
            if (ban == null)
                return NotFound(new { Message = "Không tìm thấy bàn" });
            return Ok(ban);
        }
        [HttpGet("searchban-by-trangthai")]
        public IActionResult GetBanByTrangThai([FromQuery] string trangThai)
        {
            var result = _banBll.GetBanByTrangThai(trangThai);
            return Ok(result);
        }
        [HttpPost]
        public IActionResult ThemBan([FromBody] BanModels ban)
        {
            int newId = _banBll.ThemBan(ban);
            if (newId == -2)
            {
                return BadRequest(new { Message = "Tên bàn hoặc trạng thái không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            }
            if (newId == -1)
            {
                return BadRequest(new { Message = "Tên bàn đã tồn tại, vui lòng chọn tên khác." });
            }
            return Ok(new
            {
                Message = "Thêm bàn thành công",
                ID = newId,
                Data = ban
            });
        }


        [HttpPut]
        public IActionResult CapNhatBan([FromBody] BanModels ban)
        {
            var result = _banBll.CapNhatBan(ban);
            if (result == -2)
            {
                return BadRequest(new { Message = "Tên bàn hoặc trạng thái không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            }
            if (result == -1)
            {
                return BadRequest(new { Message = "Tên bàn đã tồn tại, vui lòng chọn tên khác." });
            }
            if (result > 0)
            {
                return Ok(new { Message = "Cập nhật bàn thành công", Data = ban });
            }
            return NotFound(new { Message = "Không tìm thấy bàn để cập nhật" });
        }

        [HttpPatch("{id}/trangthai")]
        public IActionResult CapNhatTrangThaiBan(int id, [FromBody] string trangThai)
        {
            var result = _banBll.CapNhatTrangThaiBan(id, trangThai);
            if (result == -2)
            {
                return BadRequest(new { Message = "Tên bàn hoặc trạng thái không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            }
            if (result > 0)
            {
                return Ok(new { Message = "Cập nhật trạng thái bàn thành công" });
            }
            return NotFound(new { Message = "Không tìm thấy bàn để cập nhật trạng thái" });
        }

        [HttpDelete("{id}")]
        public IActionResult XoaBan(int id)
        {
            var result = _banBll.XoaBan(id);
            if (result > 0)
            {
                return Ok(new { Message = "Xóa bàn thành công" });
            }
            return NotFound(new { Message = "Không tìm thấy bàn để xóa" });
        }

    }
}
