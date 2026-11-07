using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Petshop.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Petshop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || request.Password.Length < 6 || string.IsNullOrEmpty(request.FullName))
            {
                return BadRequest(new { message = "Vui lòng điền đủ thông tin (mật khẩu >= 6 ký tự)" });
            }

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email đã tồn tại" });
            }

            var passwordHash = HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                PasswordHash = passwordHash,
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Role = "user"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                role = user.Role
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Thiếu email hoặc mật khẩu" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu" });
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu" });
            }

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                success = true,
                token = token,
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    fullName = user.FullName,
                    phoneNumber = user.PhoneNumber,
                    role = user.Role,
                    avatar = user.Avatar
                }
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                fullName = user.FullName,
                phoneNumber = user.PhoneNumber,
                address = user.Address,
                city = user.City,
                postalCode = user.PostalCode,
                role = user.Role,
                isActive = user.IsActive,
                createdAt = user.CreatedAt,
                dateOfBirth = user.DateOfBirth,
                gender = user.Gender,
                avatar = user.Avatar
            });
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UserProfileUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.DateOfBirth = dto.DateOfBirth;
            user.Gender = dto.Gender;
            user.Avatar = dto.Avatar;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật hồ sơ thành công", user });
        }

        [HttpGet("{id}/addresses")]
        public async Task<IActionResult> GetAddresses(int id)
        {
            var addresses = await _context.UserAddresses
                                          .Where(a => a.UserId == id)
                                          .OrderByDescending(a => a.IsDefault)
                                          .ToListAsync();
            return Ok(addresses);
        }

        [HttpPost("{id}/addresses")]
        public async Task<IActionResult> AddAddress(int id, [FromBody] UserAddressDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            // If it's the first address or set to default, ensure only one is default
            bool isFirst = !await _context.UserAddresses.AnyAsync(a => a.UserId == id);
            bool wantDefault = isFirst || dto.IsDefault;

            if (wantDefault)
            {
                var existingDefaults = await _context.UserAddresses.Where(a => a.UserId == id && a.IsDefault).ToListAsync();
                foreach (var addr in existingDefaults) addr.IsDefault = false;
            }

            var newAddress = new UserAddress
            {
                UserId = id,
                Name = dto.Name,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                Type = dto.Type,
                IsDefault = wantDefault
            };

            _context.UserAddresses.Add(newAddress);
            await _context.SaveChangesAsync();

            return Ok(newAddress);
        }

        [HttpPut("{id}/addresses/{addressId}")]
        public async Task<IActionResult> UpdateAddress(int id, int addressId, [FromBody] UserAddressDto dto)
        {
            var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == id);
            if (address == null) return NotFound(new { message = "Address not found" });

            if (dto.IsDefault && !address.IsDefault)
            {
                var existingDefaults = await _context.UserAddresses.Where(a => a.UserId == id && a.IsDefault).ToListAsync();
                foreach (var addr in existingDefaults) addr.IsDefault = false;
            }

            address.Name = dto.Name;
            address.Phone = dto.Phone;
            address.Address = dto.Address;
            address.City = dto.City;
            address.Type = dto.Type;
            if (dto.IsDefault) address.IsDefault = true;

            await _context.SaveChangesAsync();
            return Ok(address);
        }

        [HttpDelete("{id}/addresses/{addressId}")]
        public async Task<IActionResult> DeleteAddress(int id, int addressId)
        {
            var address = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == id);
            if (address == null) return NotFound(new { message = "Address not found" });

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();

            // If the deleted address was default, make another one default
            if (address.IsDefault)
            {
                var fallback = await _context.UserAddresses.FirstOrDefaultAsync(a => a.UserId == id);
                if (fallback != null)
                {
                    fallback.IsDefault = true;
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { message = "Đã xóa địa chỉ" });
        }

        [HttpPut("{id}/addresses/{addressId}/default")]
        public async Task<IActionResult> SetDefaultAddress(int id, int addressId)
        {
            var target = await _context.UserAddresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == id);
            if (target == null) return NotFound(new { message = "Address not found" });

            var existingDefaults = await _context.UserAddresses.Where(a => a.UserId == id && a.IsDefault).ToListAsync();
            foreach (var addr in existingDefaults) addr.IsDefault = false;

            target.IsDefault = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thiết lập mặc định" });
        }

        [HttpPut("{id}/password")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "User not found" });

            if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không chính xác" });
            }

            user.PasswordHash = HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("id", user.Id.ToString()),
                new Claim("email", user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
