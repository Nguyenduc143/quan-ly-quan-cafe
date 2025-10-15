﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL;
using Models;

namespace BLL
{
    public class EmployeesBLL
    {
        private readonly EmployeesDAL _employeesDAL;

        public EmployeesBLL(string connectionString)
        {
            _employeesDAL = new EmployeesDAL(connectionString);
        }

        public async Task<List<EmployeesModel>> GetAllEmployeesAsync()
        {
            return await _employeesDAL.GetAllEmployeesAsync();
        }

        public async Task<EmployeesModel?> GetEmployeeByIdAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("ID phải lớn hơn 0", nameof(id));
            }

            return await _employeesDAL.GetEmployeeByIdAsync(id);
        }

        public async Task<int> CreateEmployeeAsync(EmployeesModel employee)
        {
            ValidateEmployee(employee);

            return await _employeesDAL.CreateEmployeeAsync(employee);
        }

        public async Task<bool> UpdateEmployeeAsync(int id, EmployeesModel employee)
        {
            if (id <= 0)
            {
                throw new ArgumentException("ID phải lớn hơn 0", nameof(id));
            }

            ValidateEmployee(employee);

            var existingEmployee = await _employeesDAL.GetEmployeeByIdAsync(id);
            if (existingEmployee == null)
            {
                return false;
            }

            return await _employeesDAL.UpdateEmployeeAsync(id, employee);
        }

        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("ID phải lớn hơn 0", nameof(id));
            }

            var existingEmployee = await _employeesDAL.GetEmployeeByIdAsync(id);
            if (existingEmployee == null)
            {
                return false;
            }

            return await _employeesDAL.DeleteEmployeeAsync(id);
        }

        private static void ValidateEmployee(EmployeesModel employee)
        {
            if (employee == null)
            {
                throw new ArgumentNullException(nameof(employee), "Thông tin nhân viên không được null");
            }

            if (string.IsNullOrWhiteSpace(employee.HoTen))
            {
                throw new ArgumentException("Họ tên không được để trống", nameof(employee.HoTen));
            }

            if (employee.HoTen.Length > 100)
            {
                throw new ArgumentException("Họ tên không được vượt quá 100 ký tự", nameof(employee.HoTen));
            }

            if (!string.IsNullOrEmpty(employee.GioiTinh) && employee.GioiTinh.Length > 10)
            {
                throw new ArgumentException("Giới tính không được vượt quá 10 ký tự", nameof(employee.GioiTinh));
            }

            if (!string.IsNullOrEmpty(employee.Sdt) && employee.Sdt.Length > 15)
            {
                throw new ArgumentException("Số điện thoại không được vượt quá 15 ký tự", nameof(employee.Sdt));
            }

            if (!string.IsNullOrEmpty(employee.DiaChi) && employee.DiaChi.Length > 255)
            {
                throw new ArgumentException("Địa chỉ không được vượt quá 255 ký tự", nameof(employee.DiaChi));
            }

            if (!string.IsNullOrEmpty(employee.ChucVu) && employee.ChucVu.Length > 50)
            {
                throw new ArgumentException("Chức vụ không được vượt quá 50 ký tự", nameof(employee.ChucVu));
            }

            if (employee.NgaySinh.HasValue && employee.NgaySinh.Value > DateTime.Now)
            {
                throw new ArgumentException("Ngày sinh không được lớn hơn ngày hiện tại", nameof(employee.NgaySinh));
            }

            if (employee.Luong.HasValue && employee.Luong.Value < 0)
            {
                throw new ArgumentException("Lương không được âm", nameof(employee.Luong));
            }
        }
    }
}
