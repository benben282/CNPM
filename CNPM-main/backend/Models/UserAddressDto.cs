using System.ComponentModel.DataAnnotations;

namespace Petshop.API.Models
{
    public class UserAddressDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Type { get; set; } = "Nhà riêng";

        public bool IsDefault { get; set; } = false;
    }
}
