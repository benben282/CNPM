import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import PaymentQRCode from '../components/PaymentQRCode';
import { AuthContext } from '../context/AuthContext';
import { applyDiscount } from '../utils/discountLogic';
import api from '../services/api';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, checkout } = useContext(CartContext);
  const { user, loading } = useContext(AuthContext);
  const showToast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Hồ Chí Minh',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [coupon, setCoupon] = useState('');
  const [discountResult, setDiscountResult] = useState({ discountAmount: 0, message: '', success: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);

  const [userCoupons, setUserCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState(null);

  const [SAVED_ADDRESSES, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  React.useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  React.useEffect(() => {
    // Tải danh sách địa chỉ thật từ API
    if (user) {
      api.get(`/users/${user.id}/addresses`).then(res => {
        const addresses = res.data;
        setSavedAddresses(addresses);
        
        // Auto-fill
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setFormData(prev => ({
            ...prev,
            fullName: defaultAddr.name,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city
          }));
        } else {
          setSelectedAddressId('new');
        }
      }).catch(err => console.error("Could not load addresses", err));
    }
  }, [user]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setFormData(prev => ({
      ...prev,
      fullName: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city
    }));
    setErrors(prev => ({ ...prev, fullName: '', phone: '', address: '', city: '' }));
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setFormData(prev => ({
      ...prev,
      fullName: user?.fullName || '',
      phone: '',
      address: '',
      city: ''
    }));
  };

  // Fetch saved coupons on mount
  React.useEffect(() => {
    const fetchSavedCoupons = async () => {
      const savedCodes = JSON.parse(localStorage.getItem('savedCoupons') || '[]');
      if (savedCodes.length === 0) return;

      setLoadingCoupons(true);
      try {
        const promises = savedCodes.map(code => 
          api.get(`/vouchers/check?code=${code}`)
             .then(res => res.data)
             .catch((err) => {
                // Dùng Mock làm dự phòng để UI lúc nào cũng hiển thị
                const fallback = LOCAL_MOCK_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());
                return fallback || null;
             })
        );
        const results = await Promise.all(promises);
        const validCoupons = results.filter(c => c !== null);
        setUserCoupons(validCoupons);
      } catch (err) {
        console.error("Error fetching coupons", err);
      } finally {
        setLoadingCoupons(false);
      }
    };
    fetchSavedCoupons();
  }, []);

  // Totals
  const subtotal = cartTotal;
  const shippingFee = subtotal > 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountResult.discountAmount);

  // Danh sách Mockup làm dự phòng nếu Server đang tắt
  const LOCAL_MOCK_COUPONS = [
    { code: 'PETLOVE20', discountType: 'fixed', discountValue: 50000, minOrderValue: 200000, expirationDate: '2026-12-31' },
    { code: 'DOGFOOD10', discountType: 'percent', discountValue: 10, minOrderValue: 200000, categoryRestriction: 1, expirationDate: '2026-12-31' },
    { code: 'WHISKAS50K', discountType: 'fixed', discountValue: 50000, minOrderValue: 150000, categoryRestriction: 2, expirationDate: '2026-12-31' },
    { code: 'MEOWTOY5', discountType: 'percent', discountValue: 5, minOrderValue: 50000, categoryRestriction: 4, expirationDate: '2026-12-31' },
    { code: 'PETSPA5', discountType: 'percent', discountValue: 5, minOrderValue: 100000, categoryRestriction: 3, expirationDate: '2026-12-31' }
  ];

  // Apply Coupon action (Fetch từ C# Backend API)
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      removeCoupon();
      return;
    }
    try {
      const res = await api.get(`/vouchers/check?code=${coupon.trim()}`);
      const foundCoupon = res.data;
      
      const result = applyDiscount(cartItems, foundCoupon);
      setDiscountResult(result);
      if (result.success) setSelectedCouponCode(foundCoupon.code);
      else setSelectedCouponCode(null);
    } catch (err) {
      // Dùng Mock làm dự phòng nếu API sập/tắt
      console.warn("API lỗi, chạy mạng Mockup cho mã: ", coupon);
      const fallback = LOCAL_MOCK_COUPONS.find(c => c.code.toUpperCase() === coupon.trim().toUpperCase());
      if (fallback) {
          const resFallback = applyDiscount(cartItems, fallback);
          setDiscountResult(resFallback);
          if (resFallback.success) setSelectedCouponCode(fallback.code);
          else setSelectedCouponCode(null);
      } else {
        setDiscountResult({ 
          success: false, 
          message: err.response?.data?.message || 'Mã giảm giá không tồn tại hoặc lỗi kết nối!', 
          discountAmount: 0 
        });
        setSelectedCouponCode(null);
      }
    }
  };

  const selectCoupon = (couponObj) => {
    const result = applyDiscount(cartItems, couponObj);
    if (!result.success) return; 
    setDiscountResult(result);
    setSelectedCouponCode(couponObj.code);
    setCoupon(couponObj.code); 
  };

  const removeCoupon = () => {
     setDiscountResult({ success: null, message: '', discountAmount: 0 });
     setSelectedCouponCode(null);
     setCoupon('');
  };

  // Real-time validation
  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName' && !value.trim()) error = 'Vui lòng nhập họ tên';
    if (name === 'phone') {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
      if (!value.trim()) error = 'Vui lòng nhập số điện thoại';
      else if (!phoneRegex.test(value)) error = 'Số điện thoại không hợp lệ';
    }
    if (name === 'address' && !value.trim()) error = 'Vui lòng nhập địa chỉ giao hàng';
    if (name === 'city' && !value.trim()) error = 'Vui lòng nhập tỉnh/thành phố';
    if (name === 'email' && value && !/\S+@\S+\.\S+/.test(value)) error = 'Email không hợp lệ';

    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);
    try {
      const orderRes = await checkout({
        ...formData,
        paymentMethod
      });
      
      if (paymentMethod === 'qr') {
        setPendingPaymentOrder(orderRes);
        setIsProcessing(false);
        return;
      }

      showToast('Thành công', 'Đặt hàng thành công! Cảm ơn bạn đã tin tưởng PetShop.', 'success');
      setTimeout(() => navigate('/my-orders'), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đặt hàng';
      showToast('Lỗi đặt hàng', msg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0 && !pendingPaymentOrder) {
    return (
      <div className="checkout-page">
        <div className="empty-checkout">
          <div className="empty-icon">🛒</div>
          <h1>Giỏ hàng của bạn đang trống</h1>
          <p>Hãy dạo quanh cửa hàng để tìm món quà ưng ý cho thú cưng của mình nhé!</p>
          <button onClick={() => navigate('/')} className="btn-back-home">
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  if (pendingPaymentOrder) {
    return (
      <div className="checkout-page">
        <div className="checkout-header">
          <h1>Thanh toán Đơn hàng</h1>
          <p>Mã đơn hàng: <strong>{pendingPaymentOrder.orderNumber}</strong></p>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px 40px' }}>
          <PaymentQRCode 
            orderId={pendingPaymentOrder.orderNumber} 
            amount={pendingPaymentOrder.totalAmount}
            bankCode="MB"
            accountName="PetShop"
            accountNumber="0329331904"
            onSuccess={() => {
              showToast('Thành công', 'Đã xác nhận thanh toán thành công!', 'success');
              setTimeout(() => navigate('/my-orders'), 1500);
            }}
          />
          <button 
             onClick={() => navigate('/my-orders')}
             style={{ display: 'block', margin: '20px auto', padding: '12px 24px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Tôi sẽ thanh toán sau (Về danh sách đơn hàng)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>Thanh toán</h1>
        <p>Gần xong rồi! Chỉ còn một bước cuối cùng thôi.</p>
      </div>

      <div className="checkout-container">
        {/* Left Column: Info & Payment */}
        <div className="checkout-left">
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className="checkout-section">
              <h2><span>👤</span> Thông tin giao hàng</h2>

              {/* SỔ ĐỊA CHỈ */}
              {user && (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '12px' }}>Chọn từ sổ địa chỉ</h3>
                  <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }} className="hide-scrollbar">
                    {SAVED_ADDRESSES.map(addr => (
                      <div 
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        style={{ 
                          minWidth: '260px',
                          border: `2px solid ${selectedAddressId === addr.id ? 'var(--primary)' : 'var(--border)'}`, 
                          borderRadius: '12px', 
                          padding: '16px',
                          cursor: 'pointer',
                          background: selectedAddressId === addr.id ? 'rgba(255, 179, 71, 0.05)' : 'white',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text)' }}>{addr.name}</span>
                            <span style={{ fontSize: '0.7rem', background: 'var(--bg)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid var(--border)' }}>{addr.type}</span>
                         </div>
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>📞 {addr.phone}</div>
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>📍 {addr.address}, {addr.city}</div>
                      </div>
                    ))}
                    
                    <div 
                        onClick={handleSelectNewAddress}
                        style={{ 
                          minWidth: '200px',
                          border: `2px dashed ${selectedAddressId === 'new' ? 'var(--primary)' : 'var(--border)'}`, 
                          borderRadius: '12px', 
                          padding: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          background: selectedAddressId === 'new' ? 'rgba(255, 179, 71, 0.05)' : 'white',
                          transition: 'all 0.2s',
                          color: selectedAddressId === 'new' ? 'var(--primary)' : 'var(--text-muted)'
                        }}
                      >
                         <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedAddressId === 'new' ? 'var(--primary)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedAddressId === 'new' ? 'white' : 'var(--text-dim)', marginBottom: '10px', fontSize: '1.2rem' }}>+</div>
                         <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Giao đến địa chỉ khác</span>
                      </div>
                  </div>
                </div>
              )}

              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="09xx xxx xxx"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Email (Không bắt buộc)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="VD: Hà Nội, Hồ Chí Minh..."
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Địa chỉ nhận hàng *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Số nhà, tên đường, phường/xã..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú đơn hàng</label>
                  <textarea
                    name="note"
                    rows="3"
                    placeholder="Lời nhắn cho shipper..."
                    value={formData.note}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="checkout-section" style={{ marginTop: '24px' }}>
              <h2><span>💳</span> Phương thức thanh toán</h2>
              <div className="payment-grid">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <div className="payment-info">
                    <span className="payment-icon">🚚</span>
                    <div>
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                </label>

                <label className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`}>
                  <div className="payment-info">
                    <span className="payment-icon">📱</span>
                    <div>
                      <strong>Quét mã thanh toán (QR Code)</strong>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={() => setPaymentMethod('qr')}
                  />
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="checkout-right">
          <div className="summary-card">
            <h2>Đơn hàng của bạn</h2>

            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.productImage} alt={item.productName} className="item-img" />
                  <div className="item-details">
                    <div className="item-name">{item.productName}</div>
                    <div className="item-price">{item.quantity} x {item.price.toLocaleString('vi-VN')}đ</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="coupon-area" style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Nhập mã (VD: PETLOVE20)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                />
                <button type="button" onClick={handleApplyCoupon} className="btn-apply" style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--primary)', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
                  Áp dụng
                </button>
              </div>
              {discountResult.message && !selectedCouponCode && (
                <div style={{ color: discountResult.success ? '#2ED573' : '#FF4757', fontSize: '0.85rem', fontWeight: 600 }}>
                  {discountResult.message}
                </div>
              )}

              {/* Danh sách Voucher đã lưu */}
              <div className="saved-coupons-section" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span>🎟️</span> Voucher đã thu thập
                </h4>
                {loadingCoupons && <p style={{fontSize: '0.85rem'}}>Đang tải mã...</p>}
                {!loadingCoupons && userCoupons.length === 0 && <p style={{fontSize: '0.85rem', color: '#ccc'}}>Bạn chưa lưu mã giảm giá nào từ banner.</p>}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {userCoupons.map(c => {
                    const result = applyDiscount(cartItems, c);
                    const isEligible = result.success;
                    const isSelected = selectedCouponCode === c.code;

                    return (
                      <div 
                        key={c.code}
                        onClick={() => isEligible && !isSelected ? selectCoupon(c) : null}
                        style={{ 
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
                          borderRadius: '10px', 
                          padding: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: isEligible && !isSelected ? 'pointer' : (isSelected ? 'default' : 'not-allowed'),
                          opacity: isEligible ? 1 : 0.5,
                          background: isSelected ? 'rgba(var(--primary-rgb, 255, 119, 0), 0.05)' : 'white',
                          transition: 'all 0.2s',
                          boxShadow: isEligible ? '0 2px 4px rgba(0,0,0,0.02)' : 'none'
                        }}
                      >
                         <div style={{ flex: 1, marginRight: '10px' }}>
                            <div style={{ fontWeight: '800', color: 'var(--text)', fontSize: '0.95rem' }}>{c.code}</div>
                            <div style={{ fontSize: '0.8rem', color: isEligible ? '#2ED573' : '#FF4757', marginTop: '4px', lineHeight: '1.3' }}>
                               {isEligible 
                                 ? (c.discountType === 'percent' ? `Giảm ${c.discountValue}% (Tối thiểu ${c.minOrderValue / 1000}k)` : `Giảm ${(c.discountValue/1000)}k (Tối thiểu ${c.minOrderValue / 1000}k)`) 
                                 : result.message}
                            </div>
                         </div>
                         {isSelected ? (
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeCoupon(); }} style={{ padding: '6px 12px', background: '#FF4757', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Bỏ chọn</button>
                         ) : (
                            <button type="button" disabled={!isEligible} onClick={(e) => { e.stopPropagation(); if(isEligible) selectCoupon(c); }} style={{ padding: '6px 12px', background: isEligible ? 'var(--primary)' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: isEligible ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Dùng ngay</button>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
            </div>
            {discountResult.discountAmount > 0 && (
               <div className="summary-row" style={{ color: '#ea580c', fontWeight: '700' }}>
                 <span>Giảm giá (Voucher)</span>
                 <span>-{discountResult.discountAmount.toLocaleString('vi-VN')}đ</span>
               </div>
            )}

            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span>{total.toLocaleString('vi-VN')}đ</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn-order"
              disabled={isProcessing}
            >
              {isProcessing ? 'ĐANG XỬ LÝ...' : 'ĐẶT HÀNG NGAY'}
            </button>

            <div className="trust-badges">
              <div className="badge">🛡️ Thanh toán bảo mật</div>
              <div className="badge">⭐ Cam kết chính hãng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
