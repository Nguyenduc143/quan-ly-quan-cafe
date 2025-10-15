using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;

namespace DAL
{
    public class EmployeesDAL
    {
        private readonly string _connectionString;

        public EmployeesDAL(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<List<EmployeesModel>> GetAllEmployeesAsync()
        {
            var employees = new List<EmployeesModel>();

            using var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand("SELECT * FROM NhanVien", connection);

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                employees.Add(MapReaderToEmployee(reader));
            }

            return employees;
        }

        public async Task<EmployeesModel?> GetEmployeeByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand("SELECT * FROM NhanVien WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", id);

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                return MapReaderToEmployee(reader);
            }

            return null;
        }

        public async Task<int> CreateEmployeeAsync(EmployeesModel employee)
        {
            using var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand(@"
                INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu) 
                VALUES (@hoTen, @ngaySinh, @gioiTinh, @sdt, @diaChi, @Luong, @ChucVu);
                SELECT SCOPE_IDENTITY();", connection);

            AddEmployeeParameters(command, employee);

            await connection.OpenAsync();
            var result = await command.ExecuteScalarAsync();
            return Convert.ToInt32(result);
        }

        public async Task<bool> UpdateEmployeeAsync(int id, EmployeesModel employee)
        {
            using var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand(@"
                UPDATE NhanVien 
                SET hoTen = @hoTen, ngaySinh = @ngaySinh, gioiTinh = @gioiTinh, 
                    sdt = @sdt, diaChi = @diaChi, Luong = @Luong, ChucVu = @ChucVu 
                WHERE id = @id", connection);

            command.Parameters.AddWithValue("@id", id);
            AddEmployeeParameters(command, employee);

            await connection.OpenAsync();
            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var command = new SqlCommand("DELETE FROM NhanVien WHERE id = @id", connection);
            command.Parameters.AddWithValue("@id", id);

            await connection.OpenAsync();
            var rowsAffected = await command.ExecuteNonQueryAsync();
            return rowsAffected > 0;
        }

        private static EmployeesModel MapReaderToEmployee(SqlDataReader reader)
        {
            return new EmployeesModel
            {
                Id = reader.GetInt32("id"),
                HoTen = reader.GetString("hoTen"),
                NgaySinh = reader.IsDBNull("ngaySinh") ? null : reader.GetDateTime("ngaySinh"),
                GioiTinh = reader.IsDBNull("gioiTinh") ? null : reader.GetString("gioiTinh"),
                Sdt = reader.IsDBNull("sdt") ? null : reader.GetString("sdt"),
                DiaChi = reader.IsDBNull("diaChi") ? null : reader.GetString("diaChi"),
                Luong = reader.IsDBNull("Luong") ? null : reader.GetInt32("Luong"),
                ChucVu = reader.IsDBNull("ChucVu") ? null : reader.GetString("ChucVu")
            };
        }

        private static void AddEmployeeParameters(SqlCommand command, EmployeesModel employee)
        {
            command.Parameters.AddWithValue("@hoTen", employee.HoTen);
            command.Parameters.AddWithValue("@ngaySinh", (object?)employee.NgaySinh ?? DBNull.Value);
            command.Parameters.AddWithValue("@gioiTinh", (object?)employee.GioiTinh ?? DBNull.Value);
            command.Parameters.AddWithValue("@sdt", (object?)employee.Sdt ?? DBNull.Value);
            command.Parameters.AddWithValue("@diaChi", (object?)employee.DiaChi ?? DBNull.Value);
            command.Parameters.AddWithValue("@Luong", (object?)employee.Luong ?? DBNull.Value);
            command.Parameters.AddWithValue("@ChucVu", (object?)employee.ChucVu ?? DBNull.Value);
        }
    }
}
