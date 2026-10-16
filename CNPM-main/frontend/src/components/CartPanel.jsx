import React, { useContext } from 'react';
import { FaTimes, FaShoppingCart, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useToast } from '../hooks/useToast';
import { AuthContext } from '../context/AuthContext';

export default function CartPanel() {
  const { cartItems, cartTotal, updateQuantity, removeItem, cartOpen, setCartOpen } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const showToast = useToast();
  const navigate = useNavigate();

  if (!cartOpen) return null;

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleCheckout = () => {
    if (!user) {
      showToast('Đăng Nhập', 'Vui lòng đăng nhập tài khoản để tiếp tục thanh toán!', 'warning');
      setCartOpen(false);
      return;
    }
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-overlay active" onClick={() => setCartOpen(false)}></div>
      <div className="cart-panel open">
        <div className="cart-header">
          <h2><FaShoppingCart /> Giỏ Hàng</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}><FaTimes /></button>
        </div>
        
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Giỏ hàng của bạn đang trống.</p>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-info">
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{item.productName}</div>
                  <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 8px', background: 'var(--surface)', border: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: '4px' }}>-</button>
                  <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 8px', background: 'var(--surface)', border: 'none', color: 'var(--text)', cursor: 'pointer', borderRadius: '4px' }}>+</button>
                  <button onClick={() => removeItem(item.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: '8px' }}><FaTrash/></button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cartItems.length > 0 && (
          <div className="cart-footer" style={{ padding: '24px', background: 'var(--bg-card2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: '700' }}>
              <span>Tổng cộng:</span>
              <span style={{ color: 'var(--primary)' }}>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleCheckout}>
              THANH TOÁN
            </button>
          </div>
        )}
      </div>
    </>
  );
}
