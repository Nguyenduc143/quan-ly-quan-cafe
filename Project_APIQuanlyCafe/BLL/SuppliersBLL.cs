using DAL;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class SuppliersBLL
    {
        private readonly SuppliersDAL _suppliersDAL;

        public SuppliersBLL(SuppliersDAL suppliersDAL)
        {
            _suppliersDAL = suppliersDAL;
        }

        // Sync methods
        public List<SupplierModel> GetAllSuppliers()
        {
            return _suppliersDAL.GetAllSuppliers();
        }

        public SupplierModel? GetSupplierById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            return _suppliersDAL.GetSupplierById(id);
        }

        public int CreateSupplier(SupplierModel supplier)
        {
            ValidateSupplier(supplier);
            return _suppliersDAL.CreateSupplier(supplier);
        }

        public int CreateSupplier(CreateSupplierRequest request)
        {
            if (request == null)
                throw new ArgumentNullException(nameof(request), "Thông tin nhà cung cấp không được để trống");

            if (string.IsNullOrWhiteSpace(request.TenNhaCungCap))
                throw new ArgumentException("Tên nhà cung cấp không được để trống");

            return _suppliersDAL.CreateSupplier(request);
        }

        public bool UpdateSupplier(int id, SupplierModel supplier)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            ValidateSupplier(supplier);
            return _suppliersDAL.UpdateSupplier(id, supplier);
        }

        public bool DeleteSupplier(int id)
        {
            if (id <= 0)
                throw new ArgumentException("ID phải lớn hơn 0");

            return _suppliersDAL.DeleteSupplier(id);
        }

        // Private validation methods
        private static void ValidateSupplier(SupplierModel supplier)
        {
            if (supplier == null)
                throw new ArgumentNullException(nameof(supplier), "Thông tin nhà cung cấp không được để trống");

            if (string.IsNullOrWhiteSpace(supplier.TenNhaCungCap))
                throw new ArgumentException("Tên nhà cung cấp không được để trống");

            // Validate email format if provided
            if (!string.IsNullOrWhiteSpace(supplier.Email))
            {
                if (!IsValidEmail(supplier.Email))
                    throw new ArgumentException("Định dạng email không hợp lệ");
            }

            // Validate phone number format if provided
            if (!string.IsNullOrWhiteSpace(supplier.Sdt))
            {
                if (!IsValidPhoneNumber(supplier.Sdt))
                    throw new ArgumentException("Số điện thoại không hợp lệ");
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsValidPhoneNumber(string phoneNumber)
        {
            // Remove spaces and special characters
            string cleanPhone = phoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "");
            
            // Check if it contains only digits and has appropriate length
            return cleanPhone.All(char.IsDigit) && cleanPhone.Length >= 10 && cleanPhone.Length <= 15;
        }
    }
}
