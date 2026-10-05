import React, { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { FaTicketAlt, FaInfoCircle } from 'react-icons/fa';

export default function WalletCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback Mock Data giống bên Checkout
  const LOCAL_MOCK_COUPONS = [
    { code: 'PETLOVE20', discountType: 'fixed', discountValue: 50000, minOrderValue: 200000, expirationDate: '2026-12-31' },
    { code: 'DOGFOOD10', discountType: 'percent', discountValue: 10, minOrderValue: 200000, categoryRestriction: 1, expirationDate: '2026-12-31' },
    { code: 'WHISKAS50K', discountType: 'fixed', discountValue: 50000, minOrderValue: 150000, categoryRestriction: 2, expirationDate: '2026-12-31' },
    { code: 'MEOWTOY5', discountType: 'percent', discountValue: 5, minOrderValue: 50000, categoryRestriction: 4, expirationDate: '2026-12-31' },
    { code: 'PETSPA5', discountType: 'percent', discountValue: 5, minOrderValue: 100000, categoryRestriction: 3, expirationDate: '2026-12-31' }
  ];

  useEffect(() => {
    const fetchCoupons = async () => {
      const savedCodes = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      if (savedCodes.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const promises = savedCodes.map(code => 
           api.get(`/vouchers/check?code=${code}`)
             .then(res => res.data)
             .catch((err) => {
                const fallback = LOCAL_MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
                return fallback || null;
             })
        );
        const results = await Promise.all(promises);
        setCoupons(results.filter(c => c !== null));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  return (
    <div className="profile-tab-card">
      <h2 className="profile-tab-title">Ví Voucher của tôi</h2>
      
      {loading ? (
        <div className="text-center py-10 font-bold text-gray-500">Đang tải mã giảm giá...</div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FaTicketAlt className="text-4xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-500">Ví của bạn đang rỗng</h3>
          <p className="text-sm text-gray-400 mt-1">Hãy thu thập thêm mã giảm giá từ trang chủ nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coupons.map((c, idx) => (
            <div key={idx} className="voucher-card">
              <div className="voucher-left-stub">
                <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">MÃ GIẢM</span>
                <span className="text-2xl font-black">{c.discountType === 'percent' ? `${c.discountValue}%` : `${c.discountValue/1000}K`}</span>
              </div>
              <div className="voucher-right-body">
                <div>
                  <h4 className="font-extrabold text-gray-800 text-lg mb-1">{c.code}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">Đơn tối thiểu {c.minOrderValue.toLocaleString('vi-VN')}đ.</p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded-full border border-gray-200 flex items-center gap-1 shadow-sm"><FaInfoCircle/> HSD: {new Date(c.expirationDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              {/* Cắt góc xé vé */}
              <div className="absolute top-0 bottom-0 left-1/3 -ml-2 w-4 flex flex-col justify-between py-1">
                <div className="w-4 h-4 rounded-full bg-white border-b border-r border-orange-200 -mt-2"></div>
                <div className="w-4 h-4 rounded-full bg-white border-t border-r border-orange-200 -mb-2"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
