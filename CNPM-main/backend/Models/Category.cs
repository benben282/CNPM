using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Petshop.API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        // Tên danh mục (bắt buộc)
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // Slug dùng cho URL thân thiện, VD: "thuc-an-cho-cho"
        [MaxLength(120)]
        public string? Slug { get; set; }

        // Mô tả danh mục (tuỳ chọn)
        [MaxLength(500)]
        public string? Description { get; set; }

        // URL ảnh đại diện cho danh mục
        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        // Trạng thái hiển thị (true = đang hoạt động)
        public bool IsActive { get; set; } = true;

        // Navigation property — ẩn khi serialize JSON để tránh vòng lặp
        [JsonIgnore]
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
