/**
 * Hàm kiểm tra và tính toán giảm giá
 * 
 * @param {Array} cart - Giỏ hàng: [{ id, price, quantity, categoryId, name }]
 * @param {Object} coupon - Dữ liệu từ SQL: { code, minOrderValue, categoryRestriction, applicableCategoryId, discountType, discountValue, maxDiscountLimit }
 * @returns {Object} result - Kết quả trả về cho UI
 */
export const applyDiscount = (cart, coupon) => {
    if (!coupon || !cart || cart.length === 0) {
        return {
            success: false,
            message: 'Giỏ hàng trống hoặc mã giảm giá không hợp lệ',
            discountAmount: 0,
            finalTotal: 0
        };
    }

    let totalCartValue = 0;
    let eligibleItemsValue = 0;

    // Lấy điều kiện danh mục (hỗ trợ cả 2 tên biến từ phía backend trả về)
    const targetCategory = coupon.categoryRestriction || coupon.applicableCategoryId;

    // 1. Tính tổng hóa đơn và lọc giá trị sản phẩm được áp dụng mã
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalCartValue += itemTotal;

        // Nếu mã không giới hạn danh mục, HOẶC giỏ hàng có item thuộc đúng danh mục, HOẶC item chưa có categoryId (tránh chặn oan)
        const itemCatId = item.categoryId || item.CategoryRestriction || item.applicableCategoryId;
        if (!targetCategory || itemCatId === targetCategory || !itemCatId) {
            eligibleItemsValue += itemTotal;
        }
    });

    // 2. Chặn điều kiện: Giỏ hàng không có món nào thuộc danh mục áp dụng
    if (targetCategory && eligibleItemsValue === 0) {
        return {
            success: false,
            message: 'Mã giảm giá này chỉ dùng cho loại sản phẩm quy định. Vui lòng kiểm tra lại.',
            discountAmount: 0,
            finalTotal: totalCartValue
        };
    }

    // 3. Chặn điều kiện: Đơn hàng không đạt giá trị tối thiểu
    const checkValue = targetCategory ? eligibleItemsValue : totalCartValue;
    const minRequired = coupon.minOrderValue || 0;

    if (checkValue < minRequired) {
        const missingAmount = minRequired - checkValue;
        return {
            success: false,
            message: `Mua thêm ${missingAmount.toLocaleString('vi-VN')}đ để áp dụng mã ${coupon.code}!`,
            discountAmount: 0,
            finalTotal: totalCartValue
        };
    }

    // 4. Bắt đầu tính giá trị giảm giá
    let discountAmount = 0;

    if (coupon.discountType === 'percent' || coupon.DiscountPercent > 0) {
        const percent = coupon.discountValue || coupon.DiscountPercent || 0;
        discountAmount = (eligibleItemsValue * percent) / 100;

        // Giới hạn mức giảm tối đa (nếu có)
        const maxLimit = coupon.maxDiscountLimit || coupon.MaxDiscountLimit;
        if (maxLimit && discountAmount > maxLimit) {
            discountAmount = maxLimit;
        }
    } else {
        discountAmount = coupon.discountValue || coupon.DiscountAmount || 0;
    }

    // Đảm bảo tiền giảm không vượt quá tổng giá trị đơn hàng
    if (discountAmount > totalCartValue) {
        discountAmount = totalCartValue;
    }

    return {
        success: true,
        message: '🎉 Áp dụng ưu đãi thành công!',
        discountAmount: Math.round(discountAmount),
        finalTotal: Math.max(0, totalCartValue - discountAmount)
    };
};