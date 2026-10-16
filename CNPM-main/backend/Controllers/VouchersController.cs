using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petshop.API.Models;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VouchersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VouchersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================
        // CRUD APIs cho Admin
        // ============================

        // GET: api/vouchers — Lấy toàn bộ danh sách voucher
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vouchers = await _context.Vouchers
                .OrderByDescending(v => v.Id)
                .ToListAsync();
            return Ok(new { success = true, data = vouchers });
        }

        // GET: api/vouchers/{id} — Lấy chi tiết một voucher
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { success = false, message = "Không tìm thấy voucher" });

            return Ok(new { success = true, data = voucher });
        }

        // POST: api/vouchers — Tạo voucher mới
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Voucher voucher)
        {
            // Kiểm tra mã code có bị trùng không
            var exists = await _context.Vouchers
                .AnyAsync(v => v.Code.ToUpper() == voucher.Code.ToUpper());
            if (exists)
                return BadRequest(new { success = false, message = "Mã voucher này đã tồn tại" });

            // Chuẩn hóa mã về chữ hoa
            voucher.Code = voucher.Code.ToUpper().Trim();
            voucher.UsedCount = 0; // reset khi tạo mới

            // Đồng bộ CategoryRestriction với ApplicableCategoryId để tương thích ngược
            if (voucher.ApplicableCategoryId.HasValue)
                voucher.CategoryRestriction = voucher.ApplicableCategoryId;

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, data = voucher, message = "Tạo voucher thành công" });
        }

        // PUT: api/vouchers/{id} — Cập nhật voucher
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Voucher voucherUpdate)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { success = false, message = "Không tìm thấy voucher" });

            // Kiểm tra trùng code khi đổi sang code khác
            if (!string.Equals(voucher.Code, voucherUpdate.Code, StringComparison.OrdinalIgnoreCase))
            {
                var codeExists = await _context.Vouchers
                    .AnyAsync(v => v.Id != id && v.Code.ToUpper() == voucherUpdate.Code.ToUpper());
                if (codeExists)
                    return BadRequest(new { success = false, message = "Mã voucher này đã tồn tại" });
            }

            // Cập nhật từng trường
            voucher.Code = voucherUpdate.Code.ToUpper().Trim();
            voucher.DiscountType = voucherUpdate.DiscountType;
            voucher.DiscountValue = voucherUpdate.DiscountValue;
            voucher.MaxDiscountLimit = voucherUpdate.MaxDiscountLimit;
            voucher.MinOrderValue = voucherUpdate.MinOrderValue;
            voucher.UsageLimit = voucherUpdate.UsageLimit;
            voucher.ExpirationDate = voucherUpdate.ExpirationDate;
            voucher.IsActive = voucherUpdate.IsActive;
            voucher.TargetUserType = voucherUpdate.TargetUserType ?? "All";
            voucher.ApplicableCategoryId = voucherUpdate.ApplicableCategoryId;
            voucher.ApplicableProductId = voucherUpdate.ApplicableProductId;

            // Đồng bộ CategoryRestriction với ApplicableCategoryId để tương thích ngược
            voucher.CategoryRestriction = voucherUpdate.ApplicableCategoryId;

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = voucher, message = "Cập nhật voucher thành công" });
        }

        // DELETE: api/vouchers/{id} — Xóa voucher
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { success = false, message = "Không tìm thấy voucher" });

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Xóa voucher thành công" });
        }

        // ============================
        // API Validate cho Frontend Checkout
        // ============================

        // POST: api/vouchers/validate — Kiểm tra & xác thực voucher nâng cao
        // Body: { code, userId, cartProductIds, orderTotal }
        [HttpPost("validate")]
        public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest(new { success = false, message = "Vui lòng nhập mã giảm giá" });

            // Tìm voucher theo code (không phân biệt hoa thường)
            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.Code.ToUpper() == request.Code.ToUpper().Trim());

            if (voucher == null)
                return NotFound(new { success = false, message = "Mã giảm giá không tồn tại" });

            // ---- Kiểm tra các điều kiện cơ bản ----

            // 1. Kiểm tra trạng thái hoạt động và hạn sử dụng
            if (!voucher.IsActive || voucher.ExpirationDate < DateTime.UtcNow)
                return BadRequest(new { success = false, message = "Mã giảm giá đã hết hạn hoặc không còn hiệu lực" });

            // 2. Kiểm tra giới hạn lượt dùng
            if (voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit)
                return BadRequest(new { success = false, message = "Mã giảm giá đã hết lượt sử dụng" });

            // 3. Kiểm tra giá trị đơn hàng tối thiểu
            if (request.OrderTotal < voucher.MinOrderValue)
                return BadRequest(new
                {
                    success = false,
                    message = $"Đơn hàng tối thiểu {voucher.MinOrderValue:N0}đ để dùng mã này"
                });

            // ---- Kiểm tra điều kiện đối tượng khách hàng ----
            if (voucher.TargetUserType != "All" && request.UserId.HasValue)
            {
                var user = await _context.Users
                    .Include(u => u.Orders)
                    .FirstOrDefaultAsync(u => u.Id == request.UserId.Value);

                if (user != null)
                {
                    // Khách mới: chưa có đơn hàng nào hoàn thành
                    if (voucher.TargetUserType == "Newbie")
                    {
                        var hasCompletedOrder = user.Orders.Any(o => o.Status == "Delivered");
                        if (hasCompletedOrder)
                            return BadRequest(new { success = false, message = "Mã này chỉ dành cho khách hàng mới" });
                    }

                    // VIP: role = "vip" hoặc có >= 5 đơn hàng hoàn thành
                    if (voucher.TargetUserType == "VIP")
                    {
                        var deliveredCount = user.Orders.Count(o => o.Status == "Delivered");
                        bool isVip = user.Role == "vip" || deliveredCount >= 5;
                        if (!isVip)
                            return BadRequest(new { success = false, message = "Mã này chỉ dành cho khách hàng VIP" });
                    }
                }
            }

            // ---- Kiểm tra điều kiện sản phẩm/danh mục ----
            if (voucher.ApplicableProductId.HasValue && request.CartProductIds != null && request.CartProductIds.Count > 0)
            {
                // Voucher chỉ áp dụng cho sản phẩm cụ thể — kiểm tra giỏ có sản phẩm đó không
                if (!request.CartProductIds.Contains(voucher.ApplicableProductId.Value))
                    return BadRequest(new { success = false, message = "Mã giảm giá không áp dụng cho sản phẩm trong giỏ của bạn" });
            }
            else if (voucher.ApplicableCategoryId.HasValue && request.CartProductIds != null && request.CartProductIds.Count > 0)
            {
                // Voucher chỉ áp dụng cho danh mục cụ thể — kiểm tra giỏ có sản phẩm thuộc danh mục đó không
                var categoryId = voucher.ApplicableCategoryId.Value;
                var hasProductInCategory = await _context.Products
                    .AnyAsync(p => request.CartProductIds.Contains(p.Id) && p.CategoryId == categoryId);

                if (!hasProductInCategory)
                    return BadRequest(new { success = false, message = "Mã giảm giá không áp dụng cho sản phẩm trong danh mục này" });
            }
            else if (voucher.CategoryRestriction.HasValue && request.CartProductIds != null && request.CartProductIds.Count > 0)
            {
                // Tương thích ngược với CategoryRestriction cũ
                var catId = voucher.CategoryRestriction.Value;
                var hasProductInCat = await _context.Products
                    .AnyAsync(p => request.CartProductIds.Contains(p.Id) && p.CategoryId == catId);

                if (!hasProductInCat)
                    return BadRequest(new { success = false, message = "Mã giảm giá không áp dụng cho sản phẩm trong giỏ của bạn" });
            }

            // ---- Tất cả điều kiện đều hợp lệ ----
            return Ok(new
            {
                success = true,
                message = "Áp dụng mã giảm giá thành công!",
                data = new
                {
                    code = voucher.Code,
                    discountType = voucher.DiscountType,
                    discountValue = voucher.DiscountValue,
                    maxDiscountLimit = voucher.MaxDiscountLimit,
                    minOrderValue = voucher.MinOrderValue,
                    categoryRestriction = voucher.CategoryRestriction,
                    applicableCategoryId = voucher.ApplicableCategoryId,
                    applicableProductId = voucher.ApplicableProductId,
                    expirationDate = voucher.ExpirationDate
                }
            });
        }

        // GET: api/vouchers/check?code=PETLOVE20 — Alias cũ để không break trang Checkout
        [HttpGet("check")]
        public async Task<IActionResult> CheckVoucher([FromQuery] string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Vui lòng nhập mã giảm giá" });

            var voucher = await _context.Vouchers
                .FirstOrDefaultAsync(v => v.Code.ToUpper() == code.ToUpper().Trim());

            if (voucher == null)
                return NotFound(new { message = "Mã giảm giá không tồn tại hoặc đã hết hạn!" });

            if (!voucher.IsActive || voucher.ExpirationDate < DateTime.UtcNow)
                return BadRequest(new { message = "Mã giảm giá này đã hết hạn" });

            if (voucher.UsageLimit > 0 && voucher.UsedCount >= voucher.UsageLimit)
                return BadRequest(new { message = "Mã giảm giá này đã hết lượt sử dụng" });

            return Ok(new
            {
                code = voucher.Code,
                minOrderValue = voucher.MinOrderValue,
                categoryRestriction = voucher.CategoryRestriction ?? voucher.ApplicableCategoryId,
                discountType = voucher.DiscountType,
                discountValue = voucher.DiscountValue,
                maxDiscountLimit = voucher.MaxDiscountLimit,
                expirationDate = voucher.ExpirationDate
            });
        }
    }

    // DTO cho request ValidateVoucher
    public class ValidateVoucherRequest
    {
        public string Code { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public List<int> CartProductIds { get; set; } = new List<int>();
        public decimal OrderTotal { get; set; }
    }
}
