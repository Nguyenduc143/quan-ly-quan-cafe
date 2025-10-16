using Models;
using DAL;
using System.Collections.Generic;

namespace BLL
{
    public class BanBLL
    {
        private readonly BanDAL _banDal;

        public BanBLL(BanDAL banDal)
        {
            _banDal = banDal;
        }

        public List<BanModels> GetAllBan()
        {
            return _banDal.GetAllBan();
        }

        public BanModels? GetBanById(int id)
        {
            return _banDal.GetBanById(id);
        }

        public int ThemBan(BanModels ban)
        {
            int newId = _banDal.ThemBan(ban);
            if (newId == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (newId == -1)
                return -1; // Báo lỗi trùng tên
            ban.ID = newId; // Gán ID vừa tạo vào model
            return newId;
        }


        public int CapNhatBan(BanModels ban)
        {
            int result = _banDal.CapNhatBan(ban);
            if (result == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            if (result == -1)
                return -1; // Báo lỗi trùng tên bàn với bàn khác
            return result;
        }

        public int CapNhatTrangThaiBan(int id, string trangThai)
        {
            int result = _banDal.CapNhatTrangThaiBan(id, trangThai);
            if (result == -2)
                return -2; // Báo lỗi dữ liệu không hợp lệ (ký tự đặc biệt hoặc quá dài)
            return result;
        }


        public int XoaBan(int id)
        {
            return _banDal.XoaBan(id);
        }
    }
}
