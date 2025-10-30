using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;
using Microsoft.Extensions.Configuration;

namespace DAL
{
    public class EmployeesDAL
    {
        private readonly DatabaseHelper _dbHelper;

        public EmployeesDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<List<EmployeesModel>> GetAllEmployeesAsync()
        {
            var employees = new List<EmployeesModel>();

            await Task.Run(() =>
            {
                var dt = _dbHelper.ExecuteQuery("SELECT * FROM NhanVien");
                
                foreach (DataRow row in dt.Rows)
                {
                    employees.Add(MapDataRowToEmployee(row));
                }
            });

            return employees;
        }

        public async Task<EmployeesModel?> GetEmployeeByIdAsync(int id)
        {
            EmployeesModel? employee = null;

            await Task.Run(() =>
            {
                var parameters = new SqlParameter[] { new SqlParameter("@id", id) };
                var dt = _dbHelper.ExecuteQuery("SELECT * FROM NhanVien WHERE id = @id", parameters);
                
                if (dt.Rows.Count > 0)
                {
                    employee = MapDataRowToEmployee(dt.Rows[0]);
                }
            });

            return employee;
        }

        public async Task<int> CreateEmployeeAsync(EmployeesModel employee)
        {
            int newEmployeeId = 0;

            await Task.Run(() =>
            {
                var sql = @"INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu) 
                           VALUES (@hoTen, @ngaySinh, @gioiTinh, @sdt, @diaChi, @Luong, @ChucVu)";
                
                var parameters = GetEmployeeParameters(employee);
                newEmployeeId = _dbHelper.ExecuteInsertAndGetId(sql, parameters);
            });

            return newEmployeeId;
        }

        public async Task<bool> UpdateEmployeeAsync(int id, EmployeesModel employee)
        {
            bool success = false;

            await Task.Run(() =>
            {
                var sql = @"UPDATE NhanVien 
                           SET hoTen = @hoTen, ngaySinh = @ngaySinh, gioiTinh = @gioiTinh, 
                               sdt = @sdt, diaChi = @diaChi, Luong = @Luong, ChucVu = @ChucVu 
                           WHERE id = @id";

                var parameters = GetEmployeeParameters(employee);
                Array.Resize(ref parameters, parameters.Length + 1);
                parameters[parameters.Length - 1] = new SqlParameter("@id", id);

                var rowsAffected = _dbHelper.ExecuteNonQuery(sql, parameters);
                success = rowsAffected > 0;
            });

            return success;
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            bool success = false;

            await Task.Run(() =>
            {
                var parameters = new SqlParameter[] { new SqlParameter("@id", id) };
                var rowsAffected = _dbHelper.ExecuteNonQuery("DELETE FROM NhanVien WHERE id = @id", parameters);
                success = rowsAffected > 0;
            });

            return success;
        }

        public List<EmployeesModel> GetAll()
        {
            var employees = new List<EmployeesModel>();
            var dt = _dbHelper.ExecuteQuery("SELECT * FROM NhanVien");
            foreach (DataRow row in dt.Rows)
            {
                employees.Add(MapDataRowToEmployee(row));
            }
            return employees;
        }

        public EmployeesModel GetById(int id)
        {
            EmployeesModel? employee = null;
            var parameters = new SqlParameter[] { new SqlParameter("@id", id) };
            var dt = _dbHelper.ExecuteQuery("SELECT * FROM NhanVien WHERE id = @id", parameters);
            if (dt.Rows.Count > 0)
            {
                employee = MapDataRowToEmployee(dt.Rows[0]);
            }
            return employee!;
        }

        public int Create(EmployeesModel model)
        {
            var sql = @"INSERT INTO NhanVien (hoTen, ngaySinh, gioiTinh, sdt, diaChi, Luong, ChucVu) 
                        VALUES (@hoTen, @ngaySinh, @gioiTinh, @sdt, @diaChi, @Luong, @ChucVu)";
            var parameters = GetEmployeeParameters(model);
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }

        public bool Update(int id, EmployeesModel model)
        {
            var sql = @"UPDATE NhanVien 
                        SET hoTen = @hoTen, ngaySinh = @ngaySinh, gioiTinh = @gioiTinh, 
                            sdt = @sdt, diaChi = @diaChi, Luong = @Luong, ChucVu = @ChucVu 
                        WHERE id = @id";
            var parameters = GetEmployeeParameters(model);
            Array.Resize(ref parameters, parameters.Length + 1);
            parameters[parameters.Length - 1] = new SqlParameter("@id", id);
            var rowsAffected = _dbHelper.ExecuteNonQuery(sql, parameters);
            return rowsAffected > 0;
        }

        public bool Delete(int id)
        {
            var parameters = new SqlParameter[] { new SqlParameter("@id", id) };
            var rowsAffected = _dbHelper.ExecuteNonQuery("DELETE FROM NhanVien WHERE id = @id", parameters);
            return rowsAffected > 0;
        }

        private static EmployeesModel MapDataRowToEmployee(DataRow row)
        {
            return new EmployeesModel
            {
                Id = Convert.ToInt32(row["id"]),
                HoTen = row["hoTen"].ToString() ?? string.Empty,
                NgaySinh = row["ngaySinh"] == DBNull.Value ? null : Convert.ToDateTime(row["ngaySinh"]),
                GioiTinh = row["gioiTinh"] == DBNull.Value ? null : row["gioiTinh"].ToString(),
                Sdt = row["sdt"] == DBNull.Value ? null : row["sdt"].ToString(),
                DiaChi = row["diaChi"] == DBNull.Value ? null : row["diaChi"].ToString(),
                Luong = row["Luong"] == DBNull.Value ? null : Convert.ToInt32(row["Luong"]),
                ChucVu = row["ChucVu"] == DBNull.Value ? null : row["ChucVu"].ToString()
            };
        }

        private static SqlParameter[] GetEmployeeParameters(EmployeesModel employee)
        {
            return new SqlParameter[]
            {
                new SqlParameter("@hoTen", employee.HoTen),
                new SqlParameter("@ngaySinh", (object?)employee.NgaySinh ?? DBNull.Value),
                new SqlParameter("@gioiTinh", (object?)employee.GioiTinh ?? DBNull.Value),
                new SqlParameter("@sdt", (object?)employee.Sdt ?? DBNull.Value),
                new SqlParameter("@diaChi", (object?)employee.DiaChi ?? DBNull.Value),
                new SqlParameter("@Luong", (object?)employee.Luong ?? DBNull.Value),
                new SqlParameter("@ChucVu", (object?)employee.ChucVu ?? DBNull.Value)
            };
        }
    }
}
