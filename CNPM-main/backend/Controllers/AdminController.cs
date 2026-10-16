using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petshop.API.Models;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalProducts = await _context.Products.CountAsync();
                var totalOrders = await _context.Orders.CountAsync();
                var totalUsers = await _context.Users.CountAsync();
                var totalRevenue = await _context.Orders
                    .Where(o => o.Status != "Canceled" && o.Status != "Cancelled")
                    .SumAsync(o => o.TotalAmount ?? 0);

                return Ok(new
                {
                    success = true,
                    message = "Lấy thống kê thành công",
                    data = new
                    {
                        totalProducts,
                        totalOrders,
                        totalUsers,
                        totalRevenue
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetProducts(int page = 1, int limit = 10, string? search = null)
        {
            try
            {
                var query = _context.Products.Include(p => p.Category).AsQueryable();

                // Lọc sản phẩm đang hoạt động (tương đương IsDeleted = 0)
                query = query.Where(p => p.IsActive == true);

                // Tìm kiếm theo tên (nếu có)
                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(p => p.Name.Contains(search));
                }

                // Đếm tổng số lượng record thỏa mãn điều kiện
                var totalCount = await query.CountAsync();

                // Phân trang
                var products = await query
                    .OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var pagedData = products.Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Price,
                    p.OriginalPrice,
                    p.ImageUrl,
                    p.Stock,
                    p.CategoryId,
                    p.IsActive,
                    Category = p.Category != null ? new { p.Category.Id, p.Category.Name } : null
                });

                return Ok(new
                {
                    success = true,
                    message = "Lấy danh sách sản phẩm thành công",
                    data = new
                    {
                        items = pagedData,
                        total = totalCount,
                        page,
                        limit,
                        totalPages = (int)Math.Ceiling(totalCount / (double)limit)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct(Product product)
        {
            try
            {
                product.CreatedAt = DateTime.UtcNow;
                product.UpdatedAt = DateTime.UtcNow;

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, data = product, message = "Tạo sản phẩm thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, Product productUpdate)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return NotFound(new { success = false, message = "Không tìm thấy sản phẩm" });

                product.Name = productUpdate.Name;
                product.Description = productUpdate.Description;
                product.Price = productUpdate.Price;
                product.OriginalPrice = productUpdate.OriginalPrice;
                product.ImageUrl = productUpdate.ImageUrl;
                product.Stock = productUpdate.Stock;
                product.CategoryId = productUpdate.CategoryId;
                product.IsActive = productUpdate.IsActive;
                product.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = product, message = "Cập nhật sản phẩm thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null) return NotFound(new { success = false, message = "Không tìm thấy sản phẩm" });

                var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
                if (hasOrders)
                {
                    product.IsActive = false;
                    await _context.SaveChangesAsync();
                    return Ok(new { success = true, message = "Sản phẩm đã có người mua nên chỉ được chuyển trạng thái Ẩn." });
                }

                var cartItems = await _context.CartItems.Where(ci => ci.ProductId == id).ToListAsync();
                if (cartItems.Any())
                {
                    _context.CartItems.RemoveRange(cartItems);
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Xoá sản phẩm thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                var orderData = orders.Select(o => new
                {
                    o.Id,
                    o.UserId,
                    o.FullName,
                    o.Email,
                    o.PhoneNumber,
                    o.OrderNumber,
                    o.TotalAmount,
                    o.Status,
                    o.OrderDate,
                    User = o.User != null ? new { o.User.Id, o.User.FullName, o.User.Email } : null
                });

                return Ok(new { success = true, data = orderData, message = "Lấy danh sách đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("orders/{id}")]
        public async Task<IActionResult> GetOrderDetails(int id)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null) return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });

                var orderItems = await _context.OrderItems
                    .Include(oi => oi.Product)
                    .Where(oi => oi.OrderId == id)
                    .ToListAsync();

                var orderData = new
                {
                    order.Id,
                    order.UserId,
                    order.FullName,
                    order.Email,
                    order.PhoneNumber,
                    order.OrderNumber,
                    order.TotalAmount,
                    order.Status,
                    order.OrderDate,
                    Address = order.ShippingAddress,
                    City = order.ShippingCity,
                    PostalCode = order.ShippingPostalCode,
                    order.PaymentMethod,
                    User = order.User != null ? new { order.User.Id, order.User.FullName, order.User.Email } : null,
                    Items = orderItems.Select(oi => new
                    {
                        oi.Id,
                        oi.ProductId,
                        ProductName = oi.Product?.Name ?? "Sản phẩm không tồn tại",
                        ProductImage = oi.Product?.ImageUrl ?? "",
                        oi.Quantity,
                        oi.Price
                    })
                };

                return Ok(new { success = true, data = orderData, message = "Lấy chi tiết đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders.FindAsync(id);
                if (order == null) return NotFound(new { success = false, message = "Không tìm thấy đơn hàng" });

                order.Status = request.Status;

                // Nếu huỷ đơn hàng, hoàn lại (cộng thêm) số lượng vào cột Stock
                if (request.Status == "Cancelled")
                {
                    var orderItems = await _context.OrderItems.Where(oi => oi.OrderId == id).ToListAsync();
                    foreach (var item in orderItems)
                    {
                        var product = await _context.Products.FindAsync(item.ProductId);
                        if (product != null)
                        {
                            product.Stock += item.Quantity;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { success = true, data = order, message = "Cập nhật trạng thái đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = await _context.Users.ToListAsync();
                var userData = users.Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.FullName,
                    u.PhoneNumber,
                    u.Address,
                    u.City,
                    u.PostalCode,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt
                });

                return Ok(new { success = true, data = userData, message = "Lấy danh sách người dùng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // GET: api/admin/revenue-chart?days=30 — Dữ liệu doanh thu cho Line Chart
        [HttpGet("revenue-chart")]
        public async Task<IActionResult> GetRevenueChart([FromQuery] int days = 30)
        {
            try
            {
                // Tính ngày bắt đầu (days ngày trước từ hôm nay)
                var startDate = DateTime.UtcNow.Date.AddDays(-days + 1);

                // Lấy tất cả đơn hàng (loại trừ đã huỷ) để biểu đồ hiển thị ngay lập tức khi test
                var orders = await _context.Orders
                    .Where(o => o.OrderDate >= startDate && o.Status != "Canceled" && o.Status != "Cancelled")
                    .ToListAsync();

                // Tạo danh sách ngày đầy đủ (không bỏ ngày 0 doanh thu)
                var chartData = Enumerable.Range(0, days)
                    .Select(i =>
                    {
                        var date = startDate.AddDays(i);
                        var revenue = orders
                            .Where(o => o.OrderDate.Date == date)
                            .Sum(o => o.TotalAmount ?? 0);

                        return new
                        {
                            // Định dạng ngày: "DD/MM"
                            date = date.ToString("dd/MM"),
                            revenue = (double)revenue
                        };
                    })
                    .ToList();

                return Ok(new { success = true, data = chartData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
