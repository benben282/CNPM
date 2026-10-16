import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

const CouponModal = ({ isOpen, onClose, coupon }) => {
  const [isCollected, setIsCollected] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Kiểm tra localStorage xem mã đã được lưu chưa
  useEffect(() => {
    if (isOpen && coupon) {
      const savedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      if (savedCoupons.includes(coupon.code)) {
        setIsCollected(true);
      }
    }
  }, [isOpen, coupon]);

  const handleCollect = () => {
    // 1. Lưu state vào LocalStorage (cho Guest chưa login)
    const savedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
    if (!savedCoupons.includes(coupon.code)) {
      savedCoupons.push(coupon.code);
      localStorage.setItem('savedCoupons', JSON.stringify(savedCoupons));
    }
    
    // 2. Kích hoạt State & Hiệu ứng UX
    setIsCollected(true);
    setShowConfetti(true);

    setTimeout(() => {
      setShowConfetti(false);
    }, 4000); // Tắt pháo hoa sau 4s

    // 3. (Optional) Gọi API đồng bộ nếu user đã đăng nhập
    // api.post('/api/user/vouchers', { code: coupon.code });
  };

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      
      {/* Modal Container */}
      <div className="relative w-[90%] max-w-md bg-white rounded-3xl p-6 shadow-2xl transform transition-all duration-300 scale-100 overflow-hidden border border-orange-100">
        
        {/* Nút Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="text-center mb-6 mt-4">
          <div className="inline-block bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 mb-4 shadow-orange-500/30 shadow-lg transform -rotate-3">
             <span className="text-4xl">🎁</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Tuyệt Vời!</h2>
          <p className="text-gray-500 mt-1 text-sm">Bạn vừa mở khóa một ưu đãi đặc quyền cho thú cưng.</p>
        </div>

        {/* Thiết kế Coupon dạng Ticket */}
        <div className="relative bg-gradient-to-r from-orange-50 to-red-50 border-2 border-dashed border-orange-300 rounded-xl p-5 mb-6 shadow-sm">
          {/* Vết cắt tạo hình vé */}
          <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 border-r-2 border-dashed border-orange-300"></div>
          <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full transform -translate-y-1/2 border-l-2 border-dashed border-orange-300"></div>
          
          <div className="flex justify-between items-center border-b border-orange-200/60 pb-3 mb-3">
            <span className="text-3xl font-extrabold text-red-600">
              {coupon.discountType === 'percent' 
                ? `${coupon.discountValue}%` 
                : `Giảm ${coupon.discountValue / 1000}k`}
            </span>
            <span className="bg-red-100/80 text-red-600 font-bold px-3 py-1 rounded-md tracking-widest text-sm border border-red-200 shadow-sm">
              {coupon.code}
            </span>
          </div>
          
          <ul className="text-sm text-gray-700 space-y-2 font-medium">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              {coupon.categoryRestrictionName ? `Dành riêng cho: ${coupon.categoryRestrictionName}` : 'Áp dụng: Tất cả sản phẩm'}
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              Đơn hàng tối thiểu: {coupon.minOrderValue.toLocaleString('vi-VN')}đ
            </li>
            <li className="flex items-start">
              <span className="text-gray-400 mr-2">🗓</span>
              HSD: {new Date(coupon.expirationDate).toLocaleDateString('vi-VN')}
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleCollect}
          disabled={isCollected}
          className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 shadow-md flex justify-center items-center gap-2 ${
            isCollected 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/40 transform hover:-translate-y-0.5'
          }`}
        >
          {isCollected ? (
            <><span>✓</span> Đã Lưu Vào Ví</>
          ) : (
            <>Lưu Mã Vào Ví</>
          )}
        </button>
      </div>
    </div>
  );
};

export default CouponModal;
