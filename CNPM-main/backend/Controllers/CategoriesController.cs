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
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/categories — Lấy danh sách tất cả danh mục
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.OrderBy(c => c.Id).ToListAsync();
        }

        // GET: api/categories/5 — Lấy chi tiết một danh mục
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            return category;
        }

        // POST: api/categories — Tạo danh mục mới
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            // Tự động tạo Slug từ Name nếu không được cung cấp
            if (string.IsNullOrWhiteSpace(category.Slug))
            {
                category.Slug = GenerateSlug(category.Name);
            }

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/categories/5 — Cập nhật danh mục
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(int id, Category categoryUpdate)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            // Cập nhật các trường
            category.Name = categoryUpdate.Name;
            category.Slug = string.IsNullOrWhiteSpace(categoryUpdate.Slug)
                ? GenerateSlug(categoryUpdate.Name)
                : categoryUpdate.Slug;
            category.Description = categoryUpdate.Description;
            category.ImageUrl = categoryUpdate.ImageUrl;
            category.IsActive = categoryUpdate.IsActive;

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // DELETE: api/categories/5 — Xóa danh mục
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound(new { message = "Không tìm thấy danh mục" });

            // Nếu còn sản phẩm thuộc danh mục này, không cho xóa cứng — chuyển IsActive = false
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                category.IsActive = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Danh mục đang có sản phẩm, đã chuyển sang trạng thái Ẩn." });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa danh mục thành công" });
        }

        // Hàm tiện ích: Tạo slug từ tên tiếng Việt
        private static string GenerateSlug(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;

            // Chuyển về chữ thường, bỏ dấu cơ bản
            var slug = input.ToLower()
                .Replace("đ", "d")
                .Replace("á", "a").Replace("à", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
                .Replace("ă", "a").Replace("ắ", "a").Replace("ằ", "a").Replace("ẳ", "a").Replace("ẵ", "a").Replace("ặ", "a")
                .Replace("â", "a").Replace("ấ", "a").Replace("ầ", "a").Replace("ẩ", "a").Replace("ẫ", "a").Replace("ậ", "a")
                .Replace("é", "e").Replace("è", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
                .Replace("ê", "e").Replace("ế", "e").Replace("ề", "e").Replace("ể", "e").Replace("ễ", "e").Replace("ệ", "e")
                .Replace("í", "i").Replace("ì", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
                .Replace("ó", "o").Replace("ò", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
                .Replace("ô", "o").Replace("ố", "o").Replace("ồ", "o").Replace("ổ", "o").Replace("ỗ", "o").Replace("ộ", "o")
                .Replace("ơ", "o").Replace("ớ", "o").Replace("ờ", "o").Replace("ở", "o").Replace("ỡ", "o").Replace("ợ", "o")
                .Replace("ú", "u").Replace("ù", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u")
                .Replace("ư", "u").Replace("ứ", "u").Replace("ừ", "u").Replace("ử", "u").Replace("ữ", "u").Replace("ự", "u")
                .Replace("ý", "y").Replace("ỳ", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y");

            // Thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
            slug = slug.Trim('-');

            return slug;
        }
    }
}
