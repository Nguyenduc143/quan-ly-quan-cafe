using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Models;
using DAL;

namespace BLL
{
    public class ProductBLL
    {
        private readonly ProductDAL _productDal;
        public ProductBLL(ProductDAL productDal)
        {
            _productDal = productDal;
        }
        public List<CategorieModels> GetAllDanhMuc()
        {
            return _productDal.GetAllDanhMuc();
        }
        public List<GetProductbyCategorieModels> GetAllMonAn()
        {
            return _productDal.GetAllMonAn();
        }
        public List<GetProductbyCategorieModels> GetMonAnByDanhMuc(int id)
        {
            return _productDal.GetMonAnByDanhMuc(id);
        }
        public int ThemMonAn(ProductModels monAn)
        {
            int newId = _productDal.ThemMonAn(monAn);
            if (newId == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (newId == -1)
                return -1; // Báo lỗi trùng tên
            monAn.IDMonAn = newId; // Gán ID vừa tạo vào model
            return newId;
        }
        public int ThemDanhMuc(CategorieModels danhMuc)
        {
            int newId = _productDal.ThemDanhMuc(danhMuc);
            if (newId == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (newId == -1)
                return -1; // Báo lỗi trùng tên
            danhMuc.IDDanhmuc = newId; // Gán ID vừa tạo vào model
            return newId;
        }
        public int CapNhatDanhMuc(CategorieModels danhMuc)
        {
            int result = _productDal.CapNhatDanhMuc(danhMuc);
            if (result == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (result == -1)
                return -1; // Báo lỗi trùng tên danh mục với danh mục khác
            return result;
        }
        public int CapNhatMonAn(ProductModels monAn)
        {
            int result = _productDal.CapNhatMonAn(monAn);
            if (result == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (result == -1)
                return -1; // Báo lỗi trùng tên món ăn với món ăn khác
            return result;
        }
        public int XoaMonAn(int id)
        {
            return _productDal.XoaMonAn(id);
        }
    }
}
