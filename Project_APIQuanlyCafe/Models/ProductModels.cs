using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Models
{
    public class ProductModels
    {
        public int? IDMonAn { get; set; }
        public string TENMONAN { get; set; }
        public float GIATIEN { get; set; }
        public int? IDDanhmuc { get; set; }
    }
    public class CategorieModels
    {
        public int? IDDanhmuc { get; set; }
        public string TENDANHMUC { get; set; }
    }
    public class GetProductbyCategorieModels
    {
        public int? IDMonAn { get; set; }
        public string TENMONAN { get; set; }
        public float GIATIEN { get; set; }
        public string TENDANHMUC { get; set; }
    }
}
