/**
 * Hàm kiểm tra và tính toán giảm giá
 * @param {Array} cart - Giỏ hàng: [{ id, price, quantity, categoryId, name }]
 * @param {Object} coupon - Dữ liệu SQL: { code, minOrderValue, categoryRestriction, discountType, discountValue, maxDiscountLimit }
 * @returns {Object} result - Kết quả trả về cho UI
 */
export const applyDiscount = (cart, coupon) => {
  let totalCartValue = 0;
  let eligibleItemsValue = 0;

  // 1. Tính tổng hóa đơn và lọc giá trị sản phẩm được áp dụng mã
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    totalCartValue += itemTotal;

    // Nếu mã không giới hạn danh mục, HOẶC giỏ hàng có item thuộc danh mục được quy định
    if (!coupon.categoryRestriction || item.categoryId === coupon.categoryRestriction) {
      eligibleItemsValue += itemTotal;
    }
  });

  // 2. Chặn điều kiện: Đơn hàng không đạt giá tối thiểu
  if (totalCartValue < coupon.minOrderValue) {
    const missingAmount = coupon.minOrderValue - totalCartValue;
    return {
      success: false,
      message: `Mua thêm ${missingAmount.toLocaleString('vi-VN')}đ để áp dụng mã ${coupon.code}!`,
      discountAmount: 0,
      finalTotal: totalCartValue
    };
  }

  // 3. Chặn điều kiện: Giỏ hàng không có món nào thuộc danh mục áp dụng
  if (coupon.categoryRestriction && eligibleItemsValue === 0) {
    return {
      success: false,
      message: 'Mã giảm giá này chỉ dùng cho loại sản phẩm quy định. Vui lòng kiểm tra lại.',
      discountAmount: 0,
      finalTotal: totalCartValue
    };
  }

  // 4. Bắt đầu tính giá trị giảm (Có thể tính trên toàn giỏ hàng, hoặc chỉ tính trên các món được áp dụng)
  // Trong e-commerce, tiền giảm được dựa trên "giá trị sản phẩm hợp lệ" (eligibleItemsValue)
  let discountAmount = 0;

  if (coupon.discountType === 'percent') {
    discountAmount = (eligibleItemsValue * coupon.discountValue) / 100;
    
    // Nếu có nắp giới hạn (Ví dụ: Giảm 20% nhưng Tối đa 50k)
    if (coupon.maxDiscountLimit && discountAmount > coupon.maxDiscountLimit) {
      discountAmount = coupon.maxDiscountLimit;
    }
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.discountValue;
  }

  // Handle Edge Case: Tiền giảm lớn hơn tổng tiền (để giá thanh toán không bị âm)
  if (discountAmount > totalCartValue) {
    discountAmount = totalCartValue;
  }

  return {
    success: true,
    message: '🎉 Áp dụng ưu đãi thành công!',
    discountAmount,
    finalTotal: totalCartValue - discountAmount
  };
};
