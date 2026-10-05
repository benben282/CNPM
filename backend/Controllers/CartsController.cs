using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petshop.API.Models;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<Cart> GetOrCreateCartAsync(string sessionId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.SessionId == sessionId);
            if (cart == null)
            {
                cart = new Cart { SessionId = sessionId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }
            return cart;
        }

        private async Task<object> MapCartAsync(Cart cart)
        {
            var items = await _context.CartItems
                .Include(i => i.Product)
                .Where(i => i.CartId == cart.Id)
                .ToListAsync();

            return new
            {
                id = cart.Id,
                items = items.Select(i => new
                {
                    id = i.Id,
                    productId = i.ProductId,
                    productName = i.Product?.Name ?? "Unknown",
                    productImage = i.Product?.ImageUrl ?? "",
                    quantity = i.Quantity,
                    price = i.Price
                })
            };
        }

        [HttpGet("{sessionId}")]
        public async Task<IActionResult> GetCart(string sessionId)
        {
            var cart = await GetOrCreateCartAsync(sessionId);
            return Ok(await MapCartAsync(cart));
        }

        [HttpPost("{sessionId}/items")]
        public async Task<IActionResult> AddItemToCart(string sessionId, [FromBody] AddItemRequest request)
        {
            var cart = await GetOrCreateCartAsync(sessionId);
            var product = await _context.Products.FindAsync(request.ProductId);
            
            if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

            var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartId == cart.Id && i.ProductId == request.ProductId);
            if (item != null)
            {
                item.Quantity += (request.Quantity > 0 ? request.Quantity : 1);
            }
            else
            {
                _context.CartItems.Add(new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity > 0 ? request.Quantity : 1,
                    Price = product.Price
                });
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(await MapCartAsync(cart));
        }

        [HttpPut("{sessionId}/items/{itemId}")]
        public async Task<IActionResult> UpdateItemQuantity(string sessionId, int itemId, [FromBody] UpdateQuantityRequest request)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.SessionId == sessionId);
            if (cart == null) return NotFound(new { message = "Không tìm thấy giỏ hàng" });

            var item = await _context.CartItems.FirstOrDefaultAsync(i => i.Id == itemId && i.CartId == cart.Id);
            if (item == null) return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ" });

            item.Quantity = request.Quantity;
            cart.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return Ok(await MapCartAsync(cart));
        }

        [HttpDelete("{sessionId}/items/{itemId}")]
        public async Task<IActionResult> RemoveFromCart(string sessionId, int itemId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.SessionId == sessionId);
            if (cart != null)
            {
                var item = await _context.CartItems.FirstOrDefaultAsync(i => i.Id == itemId && i.CartId == cart.Id);
                if (item != null)
                {
                    _context.CartItems.Remove(item);
                    cart.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(await MapCartAsync(cart ?? new Cart { Id = 0, SessionId = sessionId }));
        }

        [HttpDelete("{sessionId}")]
        public async Task<IActionResult> ClearCart(string sessionId)
        {
            var cart = await _context.Carts.FirstOrDefaultAsync(c => c.SessionId == sessionId);
            if (cart != null)
            {
                var items = await _context.CartItems.Where(i => i.CartId == cart.Id).ToListAsync();
                _context.CartItems.RemoveRange(items);
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
    }

    public class AddItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class UpdateQuantityRequest
    {
        public int Quantity { get; set; }
    }
}
