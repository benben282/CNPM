import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTruck, FaClipboardCheck, FaTimesCircle } from 'react-icons/fa';
import OrderStatusBadge from './OrderStatusBadge';
import OrderStepper from './OrderStepper';
import { cancelOrder } from '../../services/api';

export default function OrderCard({ order, onOrderUpdated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
    setCanceling(true);
    try {
      await cancelOrder(order.id);
      if (onOrderUpdated) onOrderUpdated();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 20, border: '1px solid #f3f4f6',
      overflow: 'hidden', transition: 'box-shadow 0.2s',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid #f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
            Mã đơn: <span style={{ color: 'var(--primary)' }}>{order.orderNumber}</span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Product list */}
      <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
              background: '#f9fafb', border: '1px solid #f3f4f6', flexShrink: 0
            }}>
              <img
                src={item.productImage || 'https://placehold.co/72x72?text=?'}
                alt={item.productName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = 'https://placehold.co/72x72?text=?'; }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4 }}>
                {item.productName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Số lượng: {item.quantity}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                {item.price.toLocaleString('vi-VN')}đ
              </div>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            ... và {order.items.length - 2} sản phẩm khác
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '18px 28px', background: '#fafafa',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 16, flexWrap: 'wrap', borderTop: '1px solid #f3f4f6'
      }}>
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tổng số tiền</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
            {order.totalAmount.toLocaleString('vi-VN')}đ
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {order.status === 'Pending' && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: '#fef2f2', color: '#ef4444',
                fontSize: '0.95rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s'
              }}
            >
              <FaTimesCircle /> {canceling ? 'Đang hủy...' : 'Hủy đơn'}
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'rgba(251,146,60,0.1)', color: 'var(--primary)',
              fontSize: '0.95rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s'
            }}
          >
            {isExpanded ? 'Thu gọn' : 'Xem chi tiết'}
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ padding: '28px', borderTop: '1px solid #f3f4f6', background: '#fff' }}>
          <OrderStepper status={order.status} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 28 }}>
            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 14, border: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaClipboardCheck style={{ color: 'var(--primary)' }} /> Thông tin nhận hàng
              </div>
              <div style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 700 }}>{order.fullName}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>{order.phoneNumber}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>{order.shippingAddress}, {order.shippingCity}</div>
            </div>
            <div style={{ background: '#f9fafb', padding: 20, borderRadius: 14, border: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaTruck style={{ color: 'var(--primary)' }} /> Thanh toán & Ghi chú
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>Phương thức:</strong>{' '}
                {order.paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản / Ví điện tử'}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                "{order.note || 'Không có ghi chú'}"
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
