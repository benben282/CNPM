using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Petshop.API.Models
{
    public class Voucher
    {
        [Key]
        public int Id { get; set; }

        // Mã voucher (VD: PETLOVE20) — viết hoa, tối đa 20 ký tự
        [Required]
        [StringLength(20)]
        public string Code { get; set; } = string.Empty;

        // Loại giảm giá: "percent" hoặc "fixed"
        [Required]
        [StringLength(10)]
        public string DiscountType { get; set; } = "fixed";

        // Giá trị giảm: nếu là % thì từ 1–100, nếu là fixed thì số tiền VND
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        // Giới hạn số tiền giảm tối đa (chỉ áp dụng khi DiscountType = "percent")
        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaxDiscountLimit { get; set; }

        // Giá trị đơn hàng tối thiểu để được dùng voucher
        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderValue { get; set; }

        // ---- Các điều kiện áp dụng ----

        // Đối tượng khách hàng mục tiêu: "All" | "Newbie" | "VIP"
        [StringLength(20)]
        public string TargetUserType { get; set; } = "All";

        // Giới hạn theo danh mục cụ thể (null = áp dụng toàn shop)
        public int? ApplicableCategoryId { get; set; }

        // Giới hạn theo sản phẩm cụ thể (null = không giới hạn theo sản phẩm)
        public int? ApplicableProductId { get; set; }

        // Giữ lại tên cũ để tương thích ngược với code checkout
        public int? CategoryRestriction { get; set; }

        // Số lần dùng tối đa
        public int UsageLimit { get; set; } = 100;

        // Số lần đã sử dụng
        public int UsedCount { get; set; } = 0;

        // Ngày hết hạn
        public DateTime ExpirationDate { get; set; }

        // Trạng thái hoạt động
        public bool IsActive { get; set; } = true;
    }
}
