using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Petshop.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(50)]
        public string Role { get; set; } = "user";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(20)]
        public string? Gender { get; set; }

        [MaxLength(500)]
        public string? Avatar { get; set; }

        // Navigation properties
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();
    }
}
