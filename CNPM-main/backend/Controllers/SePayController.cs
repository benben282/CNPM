using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Petshop.API.Models;

namespace PetShop.Controllers 
{
    [Route("api/sepay")]
    [ApiController]
    public class SePayController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _dbContext;

        // Tiêm IConfiguration để lấy API Key từ file appsettings.json
        public SePayController(IConfiguration configuration, ApplicationDbContext dbContext)
        {
            _configuration = configuration;
            _dbContext = dbContext;
        }

        [HttpPost("webhook")]
        public IActionResult ReceiveWebhook([FromBody] JsonElement payload, [FromHeader(Name = "Authorization")] string authorization)
        {
            try
            {
                // ==========================================
                // 1. KIỂM TRA BẢO MẬT (API KEY)
                // ==========================================
                var mySePayToken = _configuration["SePay:WebhookToken"];

                if (string.IsNullOrEmpty(authorization) || !authorization.Contains(mySePayToken))
                {
                    Console.WriteLine("⛔ CẢNH BÁO: Phát hiện request giả mạo, Token không hợp lệ!");
                    return Unauthorized(new { success = false, message = "Invalid API Token" });
                }

                // ==========================================
                // 2. ĐỌC DỮ LIỆU TỪ SEPAY GỬI VỀ
                // ==========================================
                Console.WriteLine("✅ === CÓ BIẾN ĐỘNG SỐ DƯ (ĐÃ XÁC THỰC) ===");
                
                string transferContent = payload.GetProperty("content").GetString();
                decimal transferAmount = payload.GetProperty("transferAmount").GetDecimal();
                string referenceNumber = payload.GetProperty("referenceCode").GetString(); // Mã tham chiếu giao dịch của Ngân hàng

                // ==========================================
                // 3. TÁCH MÃ ĐƠN HÀNG TỪ NỘI DUNG CHUYỂN KHOẢN
                // ==========================================
                string orderCode = ExtractOrderCode(transferContent);

                if (!string.IsNullOrEmpty(orderCode))
                {
                    Console.WriteLine($"-> Mã đơn: {orderCode} | Số tiền: {transferAmount:N0} VNĐ | Mã GD: {referenceNumber}");

                    // ==========================================
                    // 🚀 BƯỚC TIẾP THEO CỦA BẠN: KẾT NỐI DATABASE Ở ĐÂY
                    // ==========================================
                    // 🚀 BƯỚC TIẾP THEO CỦA BẠN: KẾT NỐI DATABASE Ở ĐÂY
                    // ==========================================
                    string cleanOrderCode = orderCode.Replace("-", "");
                    var order = _dbContext.Orders.FirstOrDefault(o => o.OrderNumber.Replace("-", "") == cleanOrderCode);
                    if (order != null) 
                    {
                        if (order.TotalAmount == transferAmount) 
                        {
                            order.Status = "Pending"; // Đổi sang đang chờ xử lý thay vì AwaitingPayment
                            order.PaymentStatus = "Paid";
                            order.PaymentMethod = "Chuyển khoản (SePay QR)";
                            _dbContext.SaveChanges();
                            Console.WriteLine("🎉 -> Đã tự động cập nhật trạng thái đơn hàng thành công!");
                        } 
                        else 
                        {
                            Console.WriteLine("⚠️ -> CẢNH BÁO: Số tiền khách chuyển không khớp với tổng tiền đơn hàng!");
                        }
                    }
                    else 
                    {
                        Console.WriteLine("❌ -> Không tìm thấy đơn hàng này trong CSDL.");
                    }
                }
                else
                {
                    Console.WriteLine("⚠️ -> Không tìm thấy tiền tố mã đơn hàng (PET) trong nội dung chuyển khoản.");
                }

                // Luôn trả về HTTP 200 OK để SePay biết máy chủ đã nhận thành công
                return Ok(new { success = true, message = "Webhook processed successfully" });
            }
            catch (Exception ex)
            {
                // Nếu code lỗi, ghi log nhưng VẪN PHẢI TRẢ VỀ 200 để SePay không kẹt hệ thống gửi lại liên tục
                Console.WriteLine($"❌ Lỗi xử lý Webhook: {ex.Message}");
                return Ok(); 
            }
        }

        // Hàm hỗ trợ tách chữ số đằng sau tiền tố "ORD"
        private string ExtractOrderCode(string content)
        {
            if (string.IsNullOrEmpty(content)) return null;
            
            content = content.ToUpper();
            
            // LƯU Ý: Đổi chữ "PET" thành tiền tố bạn đã cài đặt trên SePay
           string prefix = "ORD";
            
            int startIndex = content.IndexOf(prefix);
            if (startIndex == -1) return null;

            // Cắt chuỗi từ chữ ORD và lấy các ký tự chữ/số và dấu gạch ngang (-) liền kề sau đó
            return new string(content.Substring(startIndex).TakeWhile(c => char.IsLetterOrDigit(c) || c == '-').ToArray());
        }
    }
}