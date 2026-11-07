using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Petshop.API.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public int CartId { get; set; }

        public int ProductId { get; set; }
        

        public int Quantity { get; set; } = 1;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Price { get; set; }
        public int? VariantId { get; set; }

        [MaxLength(100)]
        public string? VariantName { get; set; }

        // Navigation properties
        [ForeignKey("CartId")]
        [JsonIgnore]
        public Cart? Cart { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
