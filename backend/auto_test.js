const http = require('http');

async function runTest() {
    try {
        console.log("=== BẮT ĐẦU KIỂM TRA TỰ ĐỘNG ===");
        
        // 1. Lấy danh sách đơn hàng
        console.log("Đang lấy danh sách đơn hàng...");
        const ordersRes = await fetch('http://localhost:5237/api/orders');
        const orders = await ordersRes.json();
        
        // 2. Tìm đơn hàng đang chờ thanh toán QR
        const pendingOrder = orders.find(o => o.status === 'AwaitingPayment' || (o.paymentMethod === 'qr' && o.paymentStatus !== 'Paid'));
        
        if (!pendingOrder) {
            console.log("❌ Không tìm thấy đơn hàng nào đang chờ thanh toán QR mã!");
            console.log("👉 Vui lòng lên giao diện web và thử đặt một đơn hàng bằng quét mã QR trước.");
            return;
        }

        console.log(`✅ Tìm thấy đơn hàng: ${pendingOrder.orderNumber}`);
        console.log(`💰 Số tiền: ${pendingOrder.totalAmount} VNĐ`);

        // 3. Giả lập gọi Webhook từ SePay
        const webhookPayload = {
            gateway: "MBBank",
            transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
            accountNumber: "038",
            subAccount: null,
            transferType: "in",
            transferAmount: pendingOrder.totalAmount,
            accumulated: 1000000.0,
            code: "GD123456",
            content: `Chuyen khoan cho ${pendingOrder.orderNumber} ne`,
            referenceCode: "MB9999"
        };

        console.log("Đang gọi Webhook giả lập tới (http://localhost:5237/api/sepay/webhook)...");
        
        const webhookRes = await fetch('http://localhost:5237/api/sepay/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'PetShop_Secret_Key_2026_xyz' // Token từ appsettings.json
            },
            body: JSON.stringify(webhookPayload)
        });

        const status = webhookRes.status;
        const text = await webhookRes.text();
        
        console.log(`Kết quả Webhook -> Mã lỗi (Status): ${status}`);
        console.log(`Nội dung trả về: ${text}`);

        if (status === 200) {
            console.log("✅ Webhook đã phản hồi thành công (200 OK)!");
            console.log("🔍 Kiểm tra lại trạng thái đơn hàng trên cơ sở dữ liệu...");
            
            const checkRes = await fetch(`http://localhost:5237/api/orders/${pendingOrder.orderNumber}`);
            const checkOrder = await checkRes.json();
            
            console.log(`Trạng thái hiện tại (PaymentStatus): ${checkOrder.paymentStatus}`);
            console.log(`Trạng thái xử lý (Status): ${checkOrder.status}`);
            
            if (checkOrder.paymentStatus === 'Paid') {
                console.log("🎉 XÁC NHẬN THÀNH CÔNG TỰ ĐỘNG! Hệ thống đã ghi nhận đúng dữ liệu CSDL.");
            } else {
                console.log("❌ CSDL chưa được cập nhật. Cần kiểm tra lại DbContext trong backend.");
            }
        } else {
            console.log("❌ Lỗi gọi Webhook. Hệ thống Server backend có thể cấu hình chưa chuẩn.");
        }

    } catch (err) {
        console.error("Lỗi: ", err);
    }
}

runTest();
