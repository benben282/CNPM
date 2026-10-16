using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petshop.API.Models;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrdersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private object MapOrder(Order order)
        {
            return new
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                totalAmount = order.TotalAmount,
                status = order.Status,
                paymentStatus = order.PaymentStatus,
                orderDate = order.OrderDate,
                fullName = order.FullName,
                email = order.Email,
                phoneNumber = order.PhoneNumber,
                shippingAddress = order.ShippingAddress,
                shippingCity = order.ShippingCity,
                paymentMethod = order.PaymentMethod,
                note = order.Note,
                items = order.Items?.Select(i => (object)new
                {
                    productId = i.ProductId,
                    productName = (i.Product?.Name ?? "Unknown") + (string.IsNullOrEmpty(i.VariantName) ? "" : $" ({i.VariantName})"),
                    productImage = i.Product?.ImageUrl,
                    quantity = i.Quantity,
                    price = i.Price
                }).ToArray() ?? Array.Empty<object>()
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] int? userId)
        {
            var query = _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
            }

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
            return Ok(orders.Select(MapOrder));
        }

        [HttpGet("{orderNumber}")]
        public async Task<IActionResult> GetOrder(string orderNumber)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            // Trả về thêm PaymentStatus
            return Ok(new
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                totalAmount = order.TotalAmount,
                status = order.Status,
                paymentStatus = order.PaymentStatus,
                orderDate = order.OrderDate,
                fullName = order.FullName,
                paymentMethod = order.PaymentMethod
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            if (string.IsNullOrEmpty(request.SessionId))
                return BadRequest(new { message = "sessionId là bắt buộc" });

            if (string.IsNullOrEmpty(request.FullName) || string.IsNullOrEmpty(request.Phone) || string.IsNullOrEmpty(request.Address))
                return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin giao hàng (Họ tên, SĐT, Địa chỉ)" });

            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.SessionId == request.SessionId);
            if (cart == null) return NotFound(new { message = "Không tìm thấy giỏ hàng. Vui lòng thêm sản phẩm trước." });

            var cartItems = await _context.CartItems.Where(ci => ci.CartId == cart.Id).ToListAsync();
            if (!cartItems.Any()) return BadRequest(new { message = "Giỏ hàng đang trống" });

            // Calculate totals
            decimal subtotal = cartItems.Sum(item => (item.Price ?? 0) * item.Quantity);
            decimal shippingFee = subtotal > 500000 ? 0 : 30000;
            decimal totalAmount = subtotal + shippingFee;

            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMddHHmmss}";

            var order = new Order
            {
                UserId = request.UserId,
                OrderNumber = orderNumber,
                TotalAmount = totalAmount,
                // QR orders chưa thanh toán → AwaitingPayment; các loại khác (COD) → Pending
                Status = (request.PaymentMethod?.ToLower() == "qr") ? "AwaitingPayment" : "Pending",
                FullName = request.FullName,
                Email = request.Email ?? "",
                PhoneNumber = request.Phone,
                ShippingAddress = request.Address,
                ShippingCity = request.City ?? "Khác",
                PaymentMethod = request.PaymentMethod ?? "cod",
                Note = request.Note ?? "",
                OrderDate = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            var orderItems = cartItems.Select(ci => new OrderItem
            {
                OrderId = order.Id,
                ProductId = ci.ProductId,
                VariantId = ci.VariantId, 
                VariantName = ci.VariantName, 
                Quantity = ci.Quantity,
                Price = ci.Price
            }).ToList();

            _context.OrderItems.AddRange(orderItems);
            _context.CartItems.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // Reload order with items for response
            var newOrder = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            return StatusCode(201, MapOrder(newOrder!));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusDto request)
        {
            var allowedStatuses = new[] { "Pending", "Shipping", "Delivered", "Canceled" };
            if (string.IsNullOrEmpty(request.Status) || !allowedStatuses.Contains(request.Status))
            {
                return BadRequest(new { message = "Trạng thái không hợp lệ" });
            }

            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound(new { message = "Không tìm thấy đơn hàng" });

            if (request.Status == "Canceled" && order.Status != "Pending")
            {
                return BadRequest(new { message = "Chỉ có thể hủy đơn hàng đang chờ xác nhận" });
            }

            order.Status = request.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công", orderId = order.Id, status = order.Status });
        }
    }

    public class CreateOrderRequest
    {
        public int? UserId { get; set; }
        public string SessionId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string Note { get; set; } = string.Empty;
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
