using Microsoft.AspNetCore.Mvc;
using BLL;
using Models;

namespace QuanlyCafe.API.Admin.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeesBLL _employeesBLL;

        public EmployeesController(EmployeesBLL employeesBLL)
        {
            _employeesBLL = employeesBLL;
        }

        /// <summary>
        /// Lấy danh sách tất cả nhân viên
        /// </summary>
        /// <returns>Danh sách nhân viên</returns>
        [HttpGet]
        public async Task<ActionResult<List<EmployeesModel>>> GetAllEmployees()
        {
            try
            {
                var employees = await _employeesBLL.GetAllEmployeesAsync();
                return Ok(employees);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết nhân viên theo ID
        /// </summary>
        /// <param name="id">ID của nhân viên</param>
        /// <returns>Thông tin nhân viên</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeesModel>> GetEmployeeById(int id)
        {
            try
            {
                var employee = await _employeesBLL.GetEmployeeByIdAsync(id);

                if (employee == null)
                {
                    return NotFound(new { message = "Không tìm thấy nhân viên" });
                }

                return Ok(employee);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Thêm nhân viên mới
        /// </summary>
        /// <param name="employee">Thông tin nhân viên</param>
        /// <returns>Thông tin nhân viên đã tạo</returns>
        [HttpPost]
        public async Task<ActionResult<EmployeesModel>> CreateEmployee([FromBody] EmployeesModel employee)
        {
            try
            {
                var newEmployeeId = await _employeesBLL.CreateEmployeeAsync(employee);
                var createdEmployee = await _employeesBLL.GetEmployeeByIdAsync(newEmployeeId);

                return CreatedAtAction(nameof(GetEmployeeById), new { id = newEmployeeId }, createdEmployee);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật thông tin nhân viên
        /// </summary>
        /// <param name="id">ID của nhân viên</param>
        /// <param name="employee">Thông tin nhân viên cập nhật</param>
        /// <returns>Thông tin nhân viên đã cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<EmployeesModel>> UpdateEmployee(int id, [FromBody] EmployeesModel employee)
        {
            try
            {
                var success = await _employeesBLL.UpdateEmployeeAsync(id, employee);

                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy nhân viên để cập nhật" });
                }

                var updatedEmployee = await _employeesBLL.GetEmployeeByIdAsync(id);
                return Ok(updatedEmployee);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }

        /// <summary>
        /// Xóa nhân viên
        /// </summary>
        /// <param name="id">ID của nhân viên</param>
        /// <returns>Kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            try
            {
                var success = await _employeesBLL.DeleteEmployeeAsync(id);

                if (!success)
                {
                    return NotFound(new { message = "Không tìm thấy nhân viên để xóa" });
                }

                return Ok(new { message = "Xóa nhân viên thành công" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server", error = ex.Message });
            }
        }
    }
}

