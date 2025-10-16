using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DAL;
using Models;

namespace BLL
{
    public class InventoryBLL
    {
        private readonly InventoryDAL _inventoryDAL;

        public InventoryBLL(InventoryDAL inventoryDAL)
        {
            _inventoryDAL = inventoryDAL;
        }

        public List<InventoryModel> GetAllInventory()
        {
            try
            {
                return _inventoryDAL.GetAllInventory();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách nguyên liệu: {ex.Message}");
            }
        }

        public InventoryModel? GetInventoryById(int id)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("ID nguyên liệu không hợp lệ");

                return _inventoryDAL.GetInventoryById(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy thông tin nguyên liệu: {ex.Message}");
            }
        }

        public int CreateInventory(CreateInventoryRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.TenNguyenLieu))
                    throw new ArgumentException("Tên nguyên liệu không được để trống");

                if (request.SoLuongTon < 0)
                    throw new ArgumentException("Số lượng tồn không được âm");

                return _inventoryDAL.CreateInventory(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thêm nguyên liệu: {ex.Message}");
            }
        }

        public bool UpdateInventory(int id, UpdateInventoryRequest request)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("ID nguyên liệu không hợp lệ");

                if (string.IsNullOrWhiteSpace(request.TenNguyenLieu))
                    throw new ArgumentException("Tên nguyên liệu không được để trống");

                if (request.SoLuongTon < 0)
                    throw new ArgumentException("Số lượng tồn không được âm");

                // Kiểm tra nguyên liệu có tồn tại không
                var existingInventory = _inventoryDAL.GetInventoryById(id);
                if (existingInventory == null)
                    throw new ArgumentException("Nguyên liệu không tồn tại");

                return _inventoryDAL.UpdateInventory(id, request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật nguyên liệu: {ex.Message}");
            }
        }

        public bool DeleteInventory(int id)
        {
            try
            {
                if (id <= 0)
                    throw new ArgumentException("ID nguyên liệu không hợp lệ");

                // Kiểm tra nguyên liệu có tồn tại không
                var existingInventory = _inventoryDAL.GetInventoryById(id);
                if (existingInventory == null)
                    throw new ArgumentException("Nguyên liệu không tồn tại");

                return _inventoryDAL.DeleteInventory(id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi xóa nguyên liệu: {ex.Message}");
            }
        }

        public List<SupplierModel> GetAllSuppliers()
        {
            try
            {
                return _inventoryDAL.GetAllSuppliers();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi lấy danh sách nhà cung cấp: {ex.Message}");
            }
        }

        public int CreateSupplier(CreateSupplierRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.TenNhaCungCap))
                    throw new ArgumentException("Tên nhà cung cấp không được để trống");

                return _inventoryDAL.CreateSupplier(request);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi thêm nhà cung cấp: {ex.Message}");
            }
        }
    }
}
