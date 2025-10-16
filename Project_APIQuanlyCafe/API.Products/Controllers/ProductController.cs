using Microsoft.AspNetCore.Mvc;
using Models;
using BLL;

namespace APi_QLyQuanCafe.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ProductBLL _productBll;

        public ProductController(ProductBLL productBll)
        {
            _productBll = productBll;
        }

        // Lấy tất cả món ăn
        [HttpGet("monan")]
        public IActionResult GetAllMonAn()
        {
            var result = _productBll.GetAllMonAn();
            return Ok(result);
        }

        // Lấy tất cả danh mục
        [HttpGet("danhmuc")]
        public IActionResult GetAllDanhMuc()
        {
            var result = _productBll.GetAllDanhMuc();
            return Ok(result);
        }

        // Lấy món ăn theo id danh mục
        [HttpGet("monan/danhmuc/{id}")]
        public IActionResult GetMonAnByDanhMuc(int id)
        {
            var result = _productBll.GetMonAnByDanhMuc(id);
            return Ok(result);
        }

        // Thêm món ăn
        [HttpPost("monan")]
        public IActionResult ThemMonAn([FromBody] ProductModels monAn)
        {
            int newId = _productBll.ThemMonAn(monAn);
            if (newId == -2)
                return BadRequest(new { Message = "Tên món ăn không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            if (newId == -1)
                return BadRequest(new { Message = "Tên món ăn đã tồn tại, vui lòng chọn tên khác." });
            return Ok(new { Message = "Thêm món ăn thành công", ID = newId, Data = monAn });
        }

        // Cập nhật món ăn
        [HttpPut("monan")]
        public IActionResult CapNhatMonAn([FromBody] ProductModels monAn)
        {
            int result = _productBll.CapNhatMonAn(monAn);
            if (result == -1)
                return BadRequest(new { Message = "Tên món ăn đã tồn tại, vui lòng chọn tên khác." });
            if (result > 0)
                return Ok(new { Message = "Cập nhật món ăn thành công", Data = monAn });
            return NotFound(new { Message = "Không tìm thấy món ăn để cập nhật" });
        }

        // Xóa món ăn
        [HttpDelete("monan/{id}")]
        public IActionResult XoaMonAn(int id)
        {
            int result = _productBll.XoaMonAn(id);
            if (result > 0)
                return Ok(new { Message = "Xóa món ăn thành công" });
            return NotFound(new { Message = "Không tìm thấy món ăn để xóa" });
        }

        // Thêm danh mục
        [HttpPost("danhmuc")]
        public IActionResult ThemDanhMuc([FromBody] CategorieModels danhMuc)
        {
            int newId = _productBll.ThemDanhMuc(danhMuc);
            if (newId == -2)
                return BadRequest(new { Message = "Tên danh mục không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            if (newId == -1)
                return BadRequest(new { Message = "Tên danh mục đã tồn tại, vui lòng chọn tên khác." });
            return Ok(new { Message = "Thêm danh mục thành công", ID = newId, Data = danhMuc });
        }

        // Cập nhật danh mục
        [HttpPut("danhmuc")]
        public IActionResult CapNhatDanhMuc([FromBody] CategorieModels danhMuc)
        {
            int result = _productBll.CapNhatDanhMuc(danhMuc);
            if (result == -2)
                return BadRequest(new { Message = "Tên danh mục không hợp lệ (không ký tự đặc biệt, tối đa 100 ký tự)." });
            if (result == -1)
                return BadRequest(new { Message = "Tên danh mục đã tồn tại, vui lòng chọn tên khác." });
            if (result > 0)
                return Ok(new { Message = "Cập nhật danh mục thành công", Data = danhMuc });
            return NotFound(new { Message = "Không tìm thấy danh mục để cập nhật" });
        }

    }
}

