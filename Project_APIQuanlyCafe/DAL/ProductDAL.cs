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
            var sql = "SELECT COUNT(1) FROM MonAn WHERE tenMonAn = @tenMonAn";
            if (exceptId.HasValue)
                sql += " AND id <> @id";
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@tenMonAn", tenMonAn)
            };
            if (exceptId.HasValue)
                parameters.Add(new SqlParameter("@id", exceptId.Value));
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0;
        }
        public bool IsCategorieNameExists(string tenDanhMuc, int? exceptId = null)
        {
            var sql = "SELECT COUNT(1) FROM DanhMucMonAn WHERE tenDanhMuc = @tenDanhMuc";
            if (exceptId.HasValue)
                sql += " AND id <> @id";
            var parameters = new List<SqlParameter>
            {
                new SqlParameter("@tenDanhMuc", tenDanhMuc)
            };
            if (exceptId.HasValue)
                parameters.Add(new SqlParameter("@id", exceptId.Value));
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters.ToArray());
            return dt.Rows.Count > 0 && Convert.ToInt32(dt.Rows[0][0]) > 0;
        }

        public List<CategorieModels> GetAllDanhMuc()
        {
            var list = new List<CategorieModels>();
            var sql = "SELECT ID, TENDANHMUC FROM DanhMucMonAn";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
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
            var sql = @"
        SELECT m.ID, m.TENMONAN, m.GIATIEN, d.TENDANHMUC
        FROM MonAn m
        INNER JOIN DanhMucMonAn d ON m.IDDANHMUC = d.ID";
            DataTable dt = _dbHelper.ExecuteQuery(sql);
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
            var sql = @"
        SELECT m.ID, m.TENMONAN, m.GIATIEN, d.TENDANHMUC
        FROM MonAn m
        INNER JOIN DanhMucMonAn d ON m.IDDANHMUC = d.ID
        WHERE m.IDDANHMUC = @idDanhMuc";
            var parameters = new SqlParameter[]
            {
        new SqlParameter("@idDanhMuc", idDanhMuc)
            };
            DataTable dt = _dbHelper.ExecuteQuery(sql, parameters);
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
            var sql = "INSERT INTO DanhMucMonAn (tenDanhMuc) VALUES (@tenDanhMuc)";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDanhMuc", danhmuc.TENDANHMUC)
            };
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }
        public int ThemMonAn(ProductModels monAn)
        {
            // Validate
            if (!IsValidName(monAn.TENMONAN) || monAn.IDDanhmuc == null)
                return -2; // Invalid input

            if (IsProductNameExists(monAn.TENMONAN))
                return -1; // Duplicate

            var sql = "INSERT INTO MonAn (tenMonAn, idDanhMuc, giaTien) VALUES (@tenMonAn, @idDanhMuc, @giaTien)";
            var parameters = new SqlParameter[]
            {
        new SqlParameter("@tenMonAn", monAn.TENMONAN),
        new SqlParameter("@idDanhMuc", monAn.IDDanhmuc),
        new SqlParameter("@giaTien", monAn.GIATIEN)
            };
            return _dbHelper.ExecuteInsertAndGetId(sql, parameters);
        }



        public int CapNhatMonAn(ProductModels monAn)
        {
            // Validate
            if (!IsValidName(monAn.TENMONAN) || monAn.GIATIEN < 0 || monAn.IDDanhmuc == null)
                return -2; // Invalid input

            if (IsProductNameExists(monAn.TENMONAN, monAn.IDMonAn))
                return -1; // Duplicate

            var sql = "UPDATE MonAn SET tenMonAn = @tenMonAn, idDanhMuc = @idDanhMuc, giaTien = @giaTien WHERE id = @id";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenMonAn", monAn.TENMONAN),
                new SqlParameter("@idDanhMuc", monAn.IDDanhmuc),
                new SqlParameter("@giaTien", monAn.GIATIEN),
                new SqlParameter("@id", monAn.IDMonAn)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }
        public int CapNhatDanhMuc(CategorieModels DanhMuc)
        {
            // Validate
            if (!IsValidName(DanhMuc.TENDANHMUC) || DanhMuc.TENDANHMUC == null)
                return -2; // Invalid input

            if (IsCategorieNameExists(DanhMuc.TENDANHMUC, DanhMuc.IDDanhmuc))
                return -1; // Duplicate

            var sql = "UPDATE DanhMucMonAn SET tenDanhMuc = @tenDanhMuc WHERE id = @id";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@tenDanhMuc", DanhMuc.TENDANHMUC),
                new SqlParameter("@id", DanhMuc.IDDanhmuc)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }
        public int XoaMonAn(int idMonAn)
        {
            var sql = "DELETE FROM MonAn WHERE ID = @id";
            var parameters = new SqlParameter[]
            {
        new SqlParameter("@id", idMonAn)
            };
            return _dbHelper.ExecuteNonQuery(sql, parameters);
        }

    }
}
