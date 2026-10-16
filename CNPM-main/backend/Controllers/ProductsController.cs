using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Petshop.API.Models;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetProducts([FromQuery] int? categoryId, [FromQuery] string? search)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .Where(p => p.IsActive)
                .AsQueryable();

            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            var products = await query.OrderBy(p => p.Id).ToListAsync();

            return products.Select(MapProduct).ToList();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Variants) 
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

            if (product == null)
            {
                return NotFound(new { message = "Not found" });
            }

            return MapProduct(product);
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<object>> PostProduct(Product product)
        {
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Load category for mapping
            if (product.CategoryId.HasValue)
            {
                await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            }

            return StatusCode(201, MapProduct(product));
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutProduct(int id, Product productUpdate)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Not found" });
            }

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

            if (product.CategoryId.HasValue)
            {
                await _context.Entry(product).Reference(p => p.Category).LoadAsync();
            }

            return Ok(MapProduct(product));
        }

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Not found" });
            }

            // Soft delete
            product.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static object MapProduct(Product p)
        {
            return new
            {
                id = p.Id,
                name = p.Name,
                description = p.Description,
                price = p.Price,
                originalPrice = p.OriginalPrice,
                imageUrl = p.ImageUrl,
                stock = p.Stock,
                categoryId = p.CategoryId,
                categoryName = p.Category?.Name,
                isActive = p.IsActive,
                variants = p.Variants.OrderBy(v => v.Price).Select(v => new
                {
                    id = v.Id, name = v.Name, price = v.Price,
                    originalPrice = v.OriginalPrice, stock = v.Stock
                }).ToList(),
                images = p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList()
            };
        }
    }
}
