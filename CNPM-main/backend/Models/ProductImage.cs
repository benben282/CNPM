using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Petshop.API.Models
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }
        public int ProductId { get; set; }

        [MaxLength(500)]
        public string Url { get; set; } = string.Empty;

        public int SortOrder { get; set; }

        [ForeignKey("ProductId")]
        [JsonIgnore]
        public Product? Product { get; set; }
    }
}