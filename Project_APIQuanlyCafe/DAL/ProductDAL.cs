using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Models;
using System.Data.SqlClient;
using System.Data;

namespace DAL
{
    public class ProductDAL
    {
        private readonly DatabaseHelper _dbHelper;
        private const int MaxLength = 100;

        public ProductDAL(DatabaseHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        private bool IsValidName(string name)
        {
            if (string.IsNullOrWhiteSpace(name) || name.Length > MaxLength)
                return false;
            // Only letters, numbers, and spaces allowed
            return Regex.IsMatch(name, @"^[\p{L}\p{N} ]+$");
        }

        public bool IsProductNameExists(string tenMonAn, int? exceptId = null)
        {
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@tenMonAn", tenMonAn)
            };
            if (exceptId.HasValue)
                parameters.Add(new SqlParameter("@exceptId", exceptId.Value));

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CheckProductNameExists", parameters.ToArray());
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0;
        }

        public bool IsCategorieNameExists(string tenDanhMuc, int? exceptId = null)
        {
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@tenDanhMuc", tenDanhMuc)
            };
            if (exceptId.HasValue)
                parameters.Add(new SqlParameter("@exceptId", exceptId.Value));

            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_CheckCategorieNameExists", parameters.ToArray());
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0]["Count"]) > 0;
        }

        public List<CategorieModels> GetAllDanhMuc()
        {
            var list = new List<CategorieModels>();
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllDanhMuc");
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new CategorieModels
                {
                    IDDanhmuc = row["ID"] as int?,
                    TENDANHMUC = row["TENDANHMUC"].ToString()
                });
            }
            return list;
        }

        public List<GetProductbyCategorieModels> GetAllMonAn()
        {
            var list = new List<GetProductbyCategorieModels>();
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetAllMonAn");
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new GetProductbyCategorieModels
                {
                    IDMonAn = row["ID"] as int?,
                    TENMONAN = row["TENMONAN"].ToString(),
                    GIATIEN = float.Parse(row["GIATIEN"].ToString()),
                    TENDANHMUC = row["TENDANHMUC"].ToString()
                });
            }
            return list;
        }

        public List<GetProductbyCategorieModels> GetMonAnByDanhMuc(int idDanhMuc)
        {
            var list = new List<GetProductbyCategorieModels>();
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@idDanhMuc", idDanhMuc)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_GetMonAnByDanhMuc", parameters);
            foreach (DataRow row in dt.Rows)
            {
                list.Add(new GetProductbyCategorieModels
                {
                    IDMonAn = row["ID"] as int?,
                    TENMONAN = row["TENMONAN"].ToString(),
                    GIATIEN = float.Parse(row["GIATIEN"].ToString()),
                    TENDANHMUC = row["TENDANHMUC"].ToString()
                });
            }
            return list;
        }

        public int ThemDanhMuc(CategorieModels danhmuc)
        {
            // Validate
            if (!IsValidName(danhmuc.TENDANHMUC))
                return -2; // Invalid input
            if (IsCategorieNameExists(danhmuc.TENDANHMUC))
                return -1; // Duplicate

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDanhMuc", danhmuc.TENDANHMUC)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_ThemDanhMuc", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public int ThemMonAn(ProductModels monAn)
        {
            // Validate
            if (!IsValidName(monAn.TENMONAN) || monAn.IDDanhmuc == null)
                return -2; // Invalid input

            if (IsProductNameExists(monAn.TENMONAN))
                return -1; // Duplicate

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenMonAn", monAn.TENMONAN),
                new SqlParameter("@idDanhMuc", monAn.IDDanhmuc),
                new SqlParameter("@giaTien", monAn.GIATIEN)
            };
            DataTable dt = _dbHelper.ExecuteStoredProcedure("sp_ThemMonAn", parameters);
            if (dt.Rows.Count > 0)
            {
                return Convert.ToInt32(dt.Rows[0]["NewID"]);
            }
            return 0;
        }

        public int CapNhatMonAn(ProductModels monAn)
        {
            // Validate
            if (!IsValidName(monAn.TENMONAN) || monAn.GIATIEN < 0 || monAn.IDDanhmuc == null)
                return -2; // Invalid input

            if (IsProductNameExists(monAn.TENMONAN, monAn.IDMonAn))
                return -1; // Duplicate

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@id", monAn.IDMonAn),
                new SqlParameter("@tenMonAn", monAn.TENMONAN),
                new SqlParameter("@idDanhMuc", monAn.IDDanhmuc),
                new SqlParameter("@giaTien", monAn.GIATIEN)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_CapNhatMonAn", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        public int CapNhatDanhMuc(CategorieModels DanhMuc)
        {
            // Validate
            if (!IsValidName(DanhMuc.TENDANHMUC) || DanhMuc.TENDANHMUC == null)
                return -2; // Invalid input

            if (IsCategorieNameExists(DanhMuc.TENDANHMUC, DanhMuc.IDDanhmuc))
                return -1; // Duplicate

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@id", DanhMuc.IDDanhmuc),
                new SqlParameter("@tenDanhMuc", DanhMuc.TENDANHMUC)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_CapNhatDanhMuc", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }

        public int XoaMonAn(int idMonAn)
        {
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@id", idMonAn)
            };
            DataTable result = _dbHelper.ExecuteStoredProcedure("sp_XoaMonAn", parameters);
            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["RowsAffected"]);
            }
            return 0;
        }
    }
}

