using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Petshop.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; }

        [MaxLength(200)]
        public string? FullName { get; set; }

        [MaxLength(200)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(50)]
        public string? OrderNumber { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalAmount { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        [MaxLength(50)]
        public string PaymentStatus { get; set; } = "Unpaid";

        [MaxLength(500)]
        public string? ShippingAddress { get; set; }

        [MaxLength(100)]
        public string? ShippingCity { get; set; }

        [MaxLength(20)]
        public string? ShippingPostalCode { get; set; }

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        public string? Note { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
