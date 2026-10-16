using System;
using System.ComponentModel.DataAnnotations;

namespace Petshop.API.Models
{
    public class UserProfileUpdateDto
    {
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [MaxLength(20)]
        public string? Gender { get; set; }

        [MaxLength(500)]
        public string? Avatar { get; set; }
    }
}
