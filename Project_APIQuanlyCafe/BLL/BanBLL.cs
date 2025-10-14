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
            if (newId == -1)
                return -1; // Báo lỗi trùng tên
            ban.ID = newId; // Gán ID vừa tạo vào model
            return newId;
        }

        public int CapNhatBan(BanModels ban)
        {
            return _banDal.CapNhatBan(ban);
        }

        public int CapNhatTrangThaiBan(int id, string trangThai)
        {
            return _banDal.CapNhatTrangThaiBan(id, trangThai);
        }

        public int XoaBan(int id)
        {
            return _banDal.XoaBan(id);
        }
    }
}
