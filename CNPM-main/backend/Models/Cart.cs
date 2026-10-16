using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Petshop.API.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string SessionId { get; set; } = string.Empty;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
    }
}
